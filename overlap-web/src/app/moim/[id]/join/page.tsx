export default function JoinPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 bg-white px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900 [font-family:var(--font-headline)]">참여자 닉네임 입력</h1>
      <p className="text-sm text-slate-700 [font-family:var(--font-body)]">
        약속 코드 <span className="font-semibold text-blue-700">{params.id}</span> 에 참여할 닉네임을
        입력해주세요.
      </p>
      <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-800 [font-family:var(--font-body)]">닉네임</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none [font-family:var(--font-body)]"
            placeholder="예) 김수람"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 [font-family:var(--font-button)]"
        >
          참여하기
        </button>
      </form>
    </div>
  );
}

