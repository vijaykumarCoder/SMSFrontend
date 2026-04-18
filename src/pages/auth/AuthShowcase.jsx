import { Check, ShieldCheck } from 'lucide-react'

function Cloud({ className }) {
  return (
    <div className={`absolute rounded-full bg-white/95 shadow-[0_20px_45px_-24px_rgba(15,23,42,0.45)] ${className}`}>
      <div className="absolute -left-6 bottom-0 h-14 w-14 rounded-full bg-white/95" />
      <div className="absolute left-8 -top-4 h-16 w-16 rounded-full bg-white/95" />
      <div className="absolute right-4 -top-2 h-12 w-12 rounded-full bg-white/95" />
    </div>
  )
}

export function AuthShowcase({ message = 'Use your finger to sign in to your account', variant = 'login' }) {
  const isSignup = variant === 'signup'

  return (
    <section className="relative hidden h-screen overflow-hidden lg:block lg:flex-1">
      <div className="absolute inset-4 rounded-[28px] border border-white/60 bg-[linear-gradient(160deg,#7c83ff_0%,#8b5cf6_38%,#d946ef_100%)] shadow-[0_32px_80px_-32px_rgba(91,33,182,0.55)] xl:inset-5">
        <Cloud className="right-[-1.5rem] top-6 h-24 w-40" />
        <Cloud className="left-10 top-12 h-16 w-28 opacity-95" />
        <Cloud className="left-16 bottom-8 h-20 w-32 opacity-95" />
        <Cloud className="right-20 bottom-6 h-18 w-30 opacity-95" />

        <div className="absolute inset-x-10 top-16 flex items-start justify-between">
          <div className="rounded-[20px] bg-white px-5 py-4 shadow-[0_24px_40px_-24px_rgba(15,23,42,0.55)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand-500 shadow-inner shadow-brand-200">
              <Check size={34} strokeWidth={3} />
            </div>
          </div>
          <div className="mt-16 rounded-[20px] bg-white/90 px-5 py-4 shadow-[0_24px_40px_-24px_rgba(15,23,42,0.55)]">
            <ShieldCheck size={48} className="text-brand-500" />
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center px-8 py-8 xl:px-10">
          <div className="relative h-full max-h-[640px] w-full max-w-[520px] rounded-[26px] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05))] p-5 shadow-[0_28px_70px_-30px_rgba(15,23,42,0.65)] backdrop-blur-[2px] xl:p-6">
            <div className="absolute inset-5 rounded-[22px] bg-[linear-gradient(180deg,#8a8ffb_0%,#b15cf1_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] xl:inset-6" />
            <div className="absolute inset-5 rounded-[22px] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.1),transparent_22%)] xl:inset-6" />
            <div className="absolute left-[4%] top-[28%] h-44 w-28 rounded-[40px] bg-[#34205f]/35 blur-2xl xl:h-52 xl:w-32" />

            <div
              className={`absolute h-[340px] w-[190px] rounded-[34px] border-[8px] border-[#17183b] bg-[linear-gradient(180deg,#ff90da_0%,#cb73ff_52%,#8e95ff_100%)] shadow-[0_28px_50px_-20px_rgba(24,24,56,0.9)] xl:h-[380px] xl:w-[210px] ${
                isSignup
                  ? 'right-[7%] top-[9%] -rotate-[7deg] xl:top-[8%]'
                  : 'right-[10%] top-[12%] rotate-[8deg] xl:top-[10%]'
              }`}
            >
              <div className="absolute left-1/2 top-4 h-2 w-2 -translate-x-1/2 rounded-full bg-[#17183b]" />
              <div className="absolute inset-[16px] rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]">
                <div className="absolute left-1/2 top-[28%] flex -translate-x-1/2 flex-col items-center">
                  <div className="relative h-24 w-24 xl:h-28 xl:w-28">
                    <div className="absolute inset-0 rounded-full border-2 border-white/70" />
                    <div className="absolute inset-[14px] rounded-full border-2 border-white/70" />
                    <div className="absolute inset-[30px] rounded-full border-2 border-white/70" />
                    <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70" />
                  </div>
                  <div className="mt-8 h-2 w-28 rounded-full bg-white/85" />
                  <div className="mt-3 h-2 w-20 rounded-full bg-white/45" />
                </div>
                <div className="absolute bottom-8 left-8 right-8 text-center">
                  <p className="text-sm font-medium text-white">{message}</p>
                </div>
              </div>
            </div>

            {isSignup ? (
              <>
                <div className="absolute left-[16%] top-[38%] z-10 h-[250px] w-[152px] rounded-t-[92px] rounded-b-[36px] bg-[linear-gradient(180deg,#22c55e_0%,#16a34a_100%)] shadow-[0_18px_34px_-18px_rgba(15,23,42,0.65)] xl:h-[280px] xl:w-[170px]">
                  <div className="absolute left-[26px] top-[48px] h-[136px] w-[98px] rounded-t-[62px] rounded-b-[24px] bg-[#1f2b6b] xl:left-[28px] xl:top-[56px] xl:h-[152px] xl:w-[110px]" />
                  <div className="absolute left-[50px] top-[68px] h-14 w-14 rounded-full bg-[#f4c59e] xl:left-[56px] xl:top-[76px] xl:h-16 xl:w-16" />
                  <div className="absolute left-[22px] top-[122px] h-[116px] w-[56px] rounded-[28px] bg-[#eef2ff] xl:left-[24px] xl:top-[140px] xl:h-[128px] xl:w-[62px]" />
                  <div className="absolute left-[82px] top-[130px] h-[110px] w-[56px] rounded-[28px] bg-[#eef2ff] xl:left-[92px] xl:top-[148px] xl:h-[124px] xl:w-[62px]" />
                  <div className="absolute left-[104px] top-[124px] h-6 w-12 rotate-[18deg] rounded-full bg-[#f4c59e] xl:left-[118px] xl:top-[140px]" />
                </div>
                <div className="absolute left-[13%] top-[79%] z-10 h-6 w-24 rounded-full bg-[#1f2b6b]" />
                <div className="absolute left-[29%] top-[83%] z-10 h-6 w-24 rounded-full bg-[#1f2b6b]" />
                <div className="absolute right-[13%] top-[24%] z-20 rounded-[18px] bg-white/90 px-4 py-3 shadow-[0_20px_40px_-20px_rgba(15,23,42,0.45)]">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-emerald-100" />
                    <div>
                      <div className="h-2.5 w-16 rounded-full bg-slate-300" />
                      <div className="mt-2 h-2 w-12 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="absolute left-[18%] top-[42%] z-10 h-[230px] w-[135px] rounded-t-[90px] rounded-b-[40px] bg-[linear-gradient(180deg,#fbbf24_0%,#f59e0b_100%)] shadow-[0_16px_32px_-18px_rgba(15,23,42,0.6)] xl:top-[40%] xl:h-[265px] xl:w-[155px]">
                  <div className="absolute left-[22px] top-[54px] h-[122px] w-[88px] rounded-t-[58px] rounded-b-[24px] bg-[#2d2a72] xl:left-[24px] xl:top-[60px] xl:h-[140px] xl:w-[102px]" />
                  <div className="absolute left-[42px] top-[74px] h-14 w-14 rounded-full bg-[#f6c39a] xl:left-[46px] xl:top-[80px] xl:h-16 xl:w-16" />
                  <div className="absolute left-[22px] top-[118px] h-[126px] w-[54px] rounded-[28px] bg-white xl:left-[24px] xl:top-[132px] xl:h-[142px] xl:w-[60px]" />
                  <div className="absolute left-[70px] top-[126px] h-[120px] w-[54px] rounded-[28px] bg-white xl:left-[80px] xl:top-[140px] xl:h-[138px] xl:w-[60px]" />
                  <div className="absolute left-[102px] top-[126px] h-6 w-11 rounded-full bg-[#f6c39a] rotate-[28deg] xl:left-[118px] xl:top-[140px] xl:w-12" />
                </div>
                <div className="absolute left-[17%] top-[83%] z-10 h-6 w-24 rounded-full bg-[#2f2c77]" />
                <div className="absolute left-[31%] top-[86%] z-10 h-6 w-24 rounded-full bg-[#2f2c77]" />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
