"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  useAccount,
  useContractWrite,
  erc20ABI,
  useWalletClient,
  useNetwork,
} from "wagmi";

import LCContractABI from "@/contracts/LCContract.json";
import { useToast } from "@/components/ui/use-toast";
import { USDC_MOCK_ADDRESS, ZKLC_CONTRACT_ADDRESS } from "@/lib/consts";

const formSchema = z.object({
  applicableRule: z.string({
    required_error: "Please select an applicable rule.",
  }),

  applicantIrlAddress: z.string({
    required_error: "Please enter applicant IRL Address.",
  }),
  beneficiaryIrlAddress: z.string({
    required_error: "Please enter beneficiary IRL address.",
  }),
  beneficiaryEthAddress: z.string({
    required_error: "Please enter beneficiary eth address.",
  }),

  currencyAmount: z.string({
    required_error: "Please enter currency amount",
  }),

  // partialShipments: z.string({
  //   required_error: "Please select partial shipment.",
  // }),
  // transShipment: z.string({
  //   required_error: "Please select trans shipment.",
  // }),
  portOfLoading: z.string({
    required_error: "Please enter port of loading",
  }),
  portOfDischarge: z.string({
    required_error: "Please enter port of discharge",
  }),
  // portOfFinalDestination: z
  //   .string({
  //     // required_error: "Please enter port of discharge",
  //   })
  //   .optional(),
  // latestDateOfShipment: z.date({
  //   required_error: "Please enter latest date of shipment",
  // }),
  // periodForPresentation: z.string({
  //   required_error: "Please enter period for presentation",
  // }),

  descriptionForGoodsAndServices: z.string({
    required_error: "Please enter description for goods and services",
  }),

  dateAndPlaceForExpiry: z.date({
    required_error: "Please select date and place for expiry",
  }),

  confirmationInstructions: z.enum(["0", "1", "2"], {
    required_error: "Please enter confirmation instructions",
  }),
});

// const valuesSchema = formSchema.merge(
//   z.object({
//     sequenceOfTotal: z.number(),
//     documentaryCredit: z.string().default("IRREVOCABLE"),
//     referenceToPreAdvice: z.string().optional().default(""),
//     dateAndPlaceOfExpiry: z.date(),
//     currencyCodeAndAmount: z.string(),
//     availableWith: z.tuple([z.number(), z.string()]),
//   })
// );

export const CreateLCForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // applicableRule: "EUCP LATEST VERSION",
      // partialShipments: "NOT ALLOWED",
      // transShipment: "NOT ALLOWED",

      // ************************************ //
      // TESTING

      ...(process.env.NODE_ENV === "development"
        ? {
            applicableRule: "EUCP LATEST VERSION",
            applicantIrlAddress: "bangalore, India",
            beneficiaryIrlAddress: "London, UK",
            beneficiaryEthAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            currencyAmount: "10000",
            portOfLoading: "Chennai",
            portOfDischarge: "London",
            descriptionForGoodsAndServices: "Description of Goods and Servcies",
            dateAndPlaceForExpiry: new Date("2023-10-20"),
            confirmationInstructions: "0",
          }
        : {}),
    },
  });

  const { address: walletAddress } = useAccount();

  const { data, isLoading, isSuccess, writeAsync } = useContractWrite({
    address: ZKLC_CONTRACT_ADDRESS,
    abi: LCContractABI.abi, // TODO: fix type
    functionName: "createLC",
    // functionName: "acceptLC",
  });

  const { chain } = useNetwork();

  const { data: walletClient } = useWalletClient({
    chainId: chain?.id || undefined,
  });

  const {
    data: allowanceData,
    isLoading: allowanceIsLoading,
    isSuccess: allowanceIsSuccess,
    writeAsync: writeAllowanceAsync,
  } = useContractWrite({
    address: USDC_MOCK_ADDRESS,
    abi: erc20ABI, // TODO: fix type
    functionName: "approve",
  });

  const { toast } = useToast();

  // 2. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    console.log("values", values);

    if (!walletAddress) return;

    // await writeAllowanceAsync({
    //   args: [
    //     // walletAddress, //owner
    //     ZKLC_CONTRACT_ADDRESS, //spender
    //     BigInt(100000000),
    //   ],
    // });
    // console.log("allowanceData", allowanceData, allowanceIsSuccess);

    // 1) get the final values
    const contractArgs = [
      // _applicableRules:
      // values.applicableRule,
      // _dateAndPlaceOfExpiry:
      Math.floor(values.dateAndPlaceForExpiry.getTime() / 1000),
      // _applicant:
      values.applicantIrlAddress,
      // _beneficiary:
      {
        addressEOA: values.beneficiaryEthAddress,
        addressIRL: values.beneficiaryIrlAddress,
      },
      // [values.beneficiaryIrlAddress, values.beneficiaryEthAddress],
      // _currencyAmount:
      Number(values.currencyAmount),
      // _portDetails:
      {
        portOfLoading: values.portOfLoading,
        portOfDischarge: values.portOfDischarge,
      },
      // [values.portOfLoading, values.portOfDischarge],
      // _descriptionOfGoodsAndOrServices:
      values.descriptionForGoodsAndServices,
      // _confirmationInstructions:
      // Number(values.confirmationInstructions),
    ];

    console.log("contractArgs", contractArgs);

    // 2) call the contract
    if (!writeAsync) return;

    if (!walletClient) return;

    // await walletClient.writeContract({
    //   address: ZKLC_CONTRACT_ADDRESS,
    //   abi: LCContractABI.abi,
    //   functionName: "acceptLC",
    //   args: ["0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"],
    //   // account,
    // });

    await writeAsync({
      args: contractArgs,
      // args: ["0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"],
    });

    toast({
      title: "Scheduled: Catch up ",
      description: "Friday, February 10, 2023 at 5:57 PM",
      // action: <ToastAction altText="Goto schedule to undo">Undo</ToastAction>,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="applicableRule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Applicable Rules</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an applicable rule" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="EUCP LATEST VERSION">
                    EUCP LATEST VERSION
                  </SelectItem>
                  <SelectItem value="EUCPURR LATEST VERSION">
                    EUCPURR LATEST VERSION
                  </SelectItem>
                  <SelectItem value="UCP LATEST VERSION">
                    UCP LATEST VERSION
                  </SelectItem>
                  <SelectItem value="UCPURR LATEST VERSION">
                    UCPURR LATEST VERSION
                  </SelectItem>
                  <SelectItem value="OTHER">OTHER</SelectItem>
                </SelectContent>
              </Select>

              {/* <FormDescription>applicable rule</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="applicantIrlAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Applicant Full Address</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="beneficiaryIrlAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beneficiary Full Address</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="beneficiaryEthAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beneficiary's ETH address</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currencyAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name="partialShipments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Partial Shipments</FormLabel>
              <Select
                disabled
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ALLOWED">ALLOWED</SelectItem>
                  <SelectItem value="CONDITIONAL">CONDITIONAL</SelectItem>
                  <SelectItem value="NOT ALLOWED">NOT ALLOWED</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        /> */}

        {/* <FormField
          control={form.control}
          name="transShipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transshipment</FormLabel>
              <Select
                disabled
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ALLOWED">ALLOWED</SelectItem>
                  <SelectItem value="CONDITIONAL">CONDITIONAL</SelectItem>
                  <SelectItem value="NOT ALLOWED">NOT ALLOWED</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <FormField
          control={form.control}
          name="portOfLoading"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Port of Loading/Airport of Departure</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="portOfDischarge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Port of Discharge/Airport of Destination</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name="portOfFinalDestination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Place of Final Destination/For Transportation to.../ Place of
                Delivery
              </FormLabel>
              <FormControl>
                <Input placeholder="Port of Final Destination" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <FormField
          control={form.control}
          name="dateAndPlaceForExpiry"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date and place for Expiry</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descriptionForGoodsAndServices"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description for Goods and Services</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="description for Goods and Services"
                  {...field}
                />
              </FormControl>
              {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name="periodForPresentation"
          defaultValue={"21"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Period for Presentation</FormLabel>
              <FormControl>
                <Input type="number" placeholder="21" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <FormField
          control={form.control}
          name="confirmationInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmation Instructions</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">CONFIRM</SelectItem>
                  <SelectItem value="1">MAY ADD</SelectItem>
                  <SelectItem value="2">WITHOUT</SelectItem>
                </SelectContent>
              </Select>
              {/* <FormDescription>
                You can manage email addresses in your{" "}
                <Link href="/examples/forms">email settings</Link>.
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={!writeAsync || isLoading}>
          Submit
        </Button>
      </form>
    </Form>
  );
};
