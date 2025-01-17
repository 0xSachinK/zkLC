"use client";

import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePublicClient,
} from "wagmi";
import LCContractABI from "@/contracts/LCContract.json";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isEmptyAddress } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Check, Loader } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AVAILABLE_WITH_BY, CONFIRMATION_INSTRUCTIONS } from "@/lib/form";
import { Label } from "@/components/ui/label";
import { getLCContractAddress } from "@/lib/consts";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const formSchema = z.object({
  address: z.string({
    required_error: "Please enter address.",
  }),
});

export default function SellerLCs() {
  const { address: walletAddress, isConnected } = useAccount();
  const { chain } = useNetwork();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // ************************************ //
      // TESTING
      ...(process.env.NODE_ENV === "development"
        ? {
            address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            // address: "0xE0e05d4f780D768eb4761581256c1E18808C362d",
          }
        : {}),
    },
  });

  const address = form.watch("address");

  const {
    data: lcData,
    isError,
    isLoading,
    error,
  } = useContractRead({
    address: getLCContractAddress(chain?.id),
    abi: LCContractABI.abi,
    functionName: "getLC",
    args: [address],
    enabled: !!address && !isEmptyAddress(address),
  });

  const data = lcData as any;

  const {
    data: approveLCData,
    isLoading: isApproveLCLoading,
    isSuccess: isApproveLCSuccess,
    writeAsync: approveLCAsync,
  } = useContractWrite({
    address: getLCContractAddress(chain?.id),
    abi: LCContractABI.abi, // TODO: fix type
    functionName: "acceptLC",
    args: [address],
  });

  const { toast } = useToast();

  const publicClient = usePublicClient();

  const isErrorOREmptyData =
    isError || isEmptyAddress(data?.applicant?.addressEOA);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // console.log("submit", values);
  };

  const [isApproving, setIsApproving] = useState(false);

  const onApproveLCClick = async () => {
    setIsApproving(true);

    const tx = await approveLCAsync();

    await publicClient.waitForTransactionReceipt({
      hash: tx.hash,
    });

    if (isApproveLCSuccess) {
      toast({
        title: "LC Approved",
        variant: "success",
      });
    }

    setIsApproving(false);
  };

  return (
    <div className="flex-1 w-full flex max-w-4xl flex-col mx-auto my-16 gap-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-extrabold text-3xl">LCs</h1>
        <p className="text-foreground/80">All LCs</p>
      </div>

      <div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex gap-4 items-end"
          >
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Applicant's ETH address</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>

      <div>
        {isLoading ? <Skeleton className="w-full h-32" /> : null}
        {isErrorOREmptyData && !isLoading && !!address ? (
          <p className="text-destructive font-semibold text-lg">
            {error?.message || "Could not fetch LC for the given address"}
          </p>
        ) : null}

        {data && !isErrorOREmptyData && !isLoading ? (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground/70">
                Additional Conditions (47A)
              </p>
              <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
                {data.additionalConditions}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground/70">
                Applicant (50)
              </p>
              <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
                ETH Address: {data.applicant.addressEOA}
                <br />
                IRL Address: {data.applicant.addressIRL}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground/70">
                Beneficiary (59)
              </p>
              <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
                ETH Address: {data.beneficiary.addressEOA}
                <br />
                IRL Address: {data.beneficiary.addressIRL}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground/70">
                Available With By (41A)
              </p>
              <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
                {
                  AVAILABLE_WITH_BY[
                    (data.availableWithBy as "0", "1", "2", "3", "5")
                  ]
                }
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground/70">
                Confirmation Instructions (49)
              </p>
              <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
                {
                  CONFIRMATION_INSTRUCTIONS[
                    (data.confirmationInstructions as "0", "1", "2")
                  ]
                }
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground/70">
                Currency (32B)
              </p>
              <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
                {Number(data.currencyDetails.amount.toString()) /
                  Math.pow(10, 6)}{" "}
                {data.currencyDetails.currencyCode}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground/70">
                Description of Goods and Services (45A)
              </p>
              <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
                {data.descriptionOfGoodsAndOrServices}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground/70">
                Documents Required (46A)
              </p>
              <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
                {data.documentsRequired}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground/70">
                Issue Details
              </p>
              <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
                Applicable Rules: {data.issueDetails.applicableRules} <br />
                Date And Place of Expiry:
                {String(data.issueDetails.dateAndPlaceOfExpiry)} <br />
                Date of Issue: {String(data.issueDetails.dateOfIssue)}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground/70">
                Period for Presentation (48)
              </p>
              <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
                {String(data.periodForPresentation)}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground/70">
                Doc Credit Number (20)
              </p>
              <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
                {String(data.docCreditNumber)}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground/70">
                Form of Doc Credit (40A)
              </p>
              <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
                {/* {data.formOfDocCredit} */}
                Irrevocable
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground/70">
                Sequence of Total (27)
              </p>
              <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
                {String(data.sequenceOfTotal)}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground/70">
                Shipping Details
              </p>
              <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
                Partial Shipments:{" "}
                {String(data.shippingDetails.partialShipments)}
                <br />
                Partial Shipments: {String(data.shippingDetails.transshipment)}
                <br />
                Port of Loading:
                {data.shippingDetails.portDetails.portOfLoading}
                <br />
                Port of Discharge:
                {data.shippingDetails.portDetails.portOfDischarge}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {!isConnected ? <ConnectButton /> : null}

      {isConnected && data && !isErrorOREmptyData && !isLoading ? (
        <div className="flex flex-col gap-2">
          {!isErrorOREmptyData && !isLoading ? (
            <Button
              className="w-full"
              size="lg"
              onClick={onApproveLCClick}
              disabled={!!approveLCData || isApproving}
            >
              {!isApproving ? (
                "Approve LC"
              ) : (
                <>
                  <Loader className="animate-spin" />
                </>
              )}
            </Button>
          ) : null}

          {!!approveLCData && !isApproving ? (
            <p className="text-base text-emerald-600 font-bold flex gap-2 items-center">
              <Check />
              LC has been approved
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
