import { Logo } from '@/components/logo';

import SkipOnboarding from './skip-onboarding';
import Steps from './steps';

type Props = {
  children: React.ReactNode;
};

const Page = ({ children }: Props) => {
  return (
    <>
      <div className="absolute inset-0 hidden md:grid md:grid-cols-[30vw_1fr] lg:grid-cols-[30vw_1fr]">
        <div className=""></div>
        <div className="border-l border-border bg-background"></div>
      </div>
      <div className="relative min-h-screen bg-background md:bg-transparent">
        <div className="border-b border-border bg-background">
          <div className="mx-auto flex h-14 w-full items-center justify-between px-4 md:max-w-[95vw] lg:max-w-[80vw]">
            <Logo />
            <SkipOnboarding />
          </div>
        </div>
        <div className="mx-auto w-full md:max-w-[95vw] lg:max-w-[80vw]">
          <div className="grid md:grid-cols-[25vw_1fr] lg:grid-cols-[20vw_1fr]">
            <div className="max-w-screen flex flex-col gap-4 overflow-hidden bg-slate-100 p-4 pr-0 md:bg-transparent md:py-14">
              <div>
                <div className="text-xs font-bold uppercase text-slate-700">
                  Welcome to Openpanel
                </div>
                <div className="text-xl font-medium">Get started</div>
              </div>
              <Steps />
            </div>
            <div className="h-full p-4 md:p-14">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;