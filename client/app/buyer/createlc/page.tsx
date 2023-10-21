import { CreateLCForm } from "./form";

export default function BuyerCreateLC() {
  return (
    <div className="flex-1 w-full flex max-w-4xl flex-col mx-auto my-16 gap-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-extrabold text-3xl">Create LC</h1>
        <p className="text-foreground/80">
          Create a new Letter-of-Credit and lock collateral.
        </p>
      </div>

      <CreateLCForm />
    </div>
  );
}
