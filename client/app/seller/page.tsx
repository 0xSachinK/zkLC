"use client";

import { USDC_MOCK_ADDRESS, ZKLC_CONTRACT_ADDRESS } from "@/lib/consts";
import { useContractRead, useContractWrite } from "wagmi";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Check } from "lucide-react";

const formSchema = z.object({
  address: z.string({
    required_error: "Please enter address.",
  }),
});

export default function SellerLCs() {
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
    address: ZKLC_CONTRACT_ADDRESS,
    abi: LCContractABI.abi,
    functionName: "getLC",
    args: [address],
  });

  const data = lcData as any;

  const {
    data: approveLCData,
    isLoading: isAproveLCLoading,
    isSuccess: isApproveLCSuccess,
    writeAsync: approveLCAsync,
  } = useContractWrite({
    address: ZKLC_CONTRACT_ADDRESS,
    abi: LCContractABI.abi, // TODO: fix type
    functionName: "acceptLC",
    args: [address],
  });

  const {
    data: acceptedLCData,
    isError: isAcceptedLCError,
    isLoading: acceptedLcLoading,
    error: acceptedLCError,
  } = useContractRead({
    address: ZKLC_CONTRACT_ADDRESS,
    abi: LCContractABI.abi,
    functionName: "acceptedLC",
    args: [address],
    watch: true,
  });

  const { toast } = useToast();

  const isErrorOREmptyData =
    isError || isEmptyAddress(data?.applicant?.addressEOA);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // console.log("submit", values);
  };

  const onApproveLCClick = async () => {
    await approveLCAsync();

    if (isApproveLCSuccess) {
      toast({
        title: "LC Approved",
      });
    }
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
        {isErrorOREmptyData && !isLoading ? (
          <p className="text-destructive font-semibold text-lg">
            {error?.message || "Could not fetch LC for the given address"}
          </p>
        ) : null}

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground/70">
              Additional Conditions
            </p>
            <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
              {data.additionalConditions}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground/70">Applicant</p>
            <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
              ETH Address: {data.applicant.addressEOA}
              <br />
              IRL Address: {data.applicant.addressIRL}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground/70">
              Beneficiary
            </p>
            <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
              ETH Address: {data.beneficiary.addressEOA}
              <br />
              IRL Address: {data.beneficiary.addressIRL}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground/70">
              Available With By
            </p>
            <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
              {data.availableWithBy}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground/70">
              Confirmation Instructions
            </p>
            <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
              {data.confirmationInstructions}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground/70">Currency</p>
            <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
              {data.currencyDetails.amount.toString()}{" "}
              {data.currencyDetails.currencyCode}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground/70">
              Description of Goods and Services
            </p>
            <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
              {data.descriptionOfGoodsAndOrServices}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground/70">
              Documents Required
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
              Period for Presentation
            </p>
            <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
              {String(data.periodForPresentation)}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground/70">
              Doc Credit Number
            </p>
            <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
              {String(data.docCreditNumber)}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground/70">
              Form of Doc Credit
            </p>
            <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
              {data.formOfDocCredit}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground/70">
              Sequence of Total
            </p>
            <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
              {String(data.sequenceOfTotal)}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground/70">
              Period for Presentation
            </p>
            <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
              {String(data.periodForPresentation)}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground/70">
              Shipping Details
            </p>
            <p className="text-foreground/90 text-base font-medium px-3 py-2 rounded-xl bg-foreground/10">
              Partial Shipments: {String(data.shippingDetails.partialShipments)}
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
      </div>

      <div className="flex flex-col gap-2">
        {!isErrorOREmptyData && !isLoading ? (
          <Button
            className="w-full"
            size="lg"
            onClick={onApproveLCClick}
            disabled={!!acceptedLCData}
          >
            Approve LC
          </Button>
        ) : null}

        {!!acceptedLCData ? (
          <p className="text-base text-emerald-600 font-bold flex gap-2 items-center">
            <Check />
            LC has been approved
          </p>
        ) : null}
      </div>
    </div>
  );
}
