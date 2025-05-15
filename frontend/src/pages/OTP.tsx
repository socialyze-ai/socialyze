import { useState } from "react";
import { useVerifyOTP } from "@/api/apiHooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";

const OTP = () => {
  const [otpValue, setOtpValue] = useState("");
  const { mutate: verifyOTPMutation, isPending: isVerifying } = useVerifyOTP();

  const handleVerify = () => {
    if (otpValue.length !== 6) {
      toast.error("Please enter complete 6-digit OTP", {
        position: "top-center",
      });
      return;
    }

    verifyOTPMutation({ otpValue });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Verify OTP</CardTitle>
          <CardDescription className="text-center">
            Please enter the 6-digit code sent to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otpValue} onChange={(value) => setOtpValue(value)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button className="w-full" onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="text-center text-sm text-gray-500">
            <p>
              Didn't receive code?{" "}
              <Button variant="link" className="p-0">
                Resend OTP
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTP;
