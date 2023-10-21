import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 w-full flex items-center justify-center">
      <div className="flex gap-4">
        <div className="flex flex-col gap-5">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Buyer</CardTitle>
              <CardDescription>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" size="lg" asChild>
                <Link href="/buyer/createlc">Create LC</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="h-fit">
            <CardContent className="pt-4 flex flex-col gap-7">
              <div className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 mt-0.5" />

                <div className="flex flex-col gap-1">
                  <p className="text-foreground font-medium">
                    Create LC and Lock Collateral
                  </p>
                  <p className="text-foreground/70">
                    No Bank/intermediatery needed, secure & verifiable.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 mt-0.5" />

                <div className="flex flex-col gap-1">
                  <p className="text-foreground font-medium">
                    Secure & verifiable
                  </p>
                  <p className="text-foreground/70">
                    Lorem Ipsum is simply dummy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator orientation="vertical" className="h-96" />

        <div className="flex flex-col gap-5">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Seller</CardTitle>
              <CardDescription>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" size="lg">
                Verify/Complette LC
              </Button>
            </CardFooter>
          </Card>

          <Card className="h-fit">
            <CardContent className="pt-4">
              <div className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 mt-0.5" />

                <div className="flex flex-col gap-1">
                  <p className="text-foreground font-medium">Sell Instantly</p>
                  <p className="text-foreground/70">
                    Lorem Ipsum is simply dummy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
