import {
  DEMO_REPO,
  ISSUE_6620,
  PR_URL,
  failLine,
  fixDiff,
  matrix,
  passLines,
  reproCommands,
  timeline,
  type Outcome,
} from "./data";

function Badge({ outcome }: { outcome: Outcome }) {
  const pass = outcome === "pass";

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        pass ? "bg-good-tint text-good" : "bg-bad-tint text-bad"
      }`}
    >
      {pass ? "pass" : "fails at startup"}
    </span>
  );
}

function Code({ children, label }: { children: string; label: string }) {
  return (
    <pre
      aria-label={label}
      tabIndex={0}
      className="overflow-x-auto rounded-lg bg-code p-4 font-mono text-[13px] leading-relaxed text-code-text"
    >
      <code>{children}</code>
    </pre>
  );
}

function DiffBlock() {
  return (
    <pre
      aria-label="The change to kv_cache_access"
      tabIndex={0}
      className="overflow-x-auto rounded-lg bg-code p-4 font-mono text-[13px] leading-relaxed text-code-text"
    >
      <code>
        {fixDiff.split("\n").map((line, i) => (
          <span key={i} className={line.startsWith("+") ? "block text-code-green" : "block"}>
            {line}
          </span>
        ))}
      </code>
    </pre>
  );
}

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-5 sm:pt-10">
      <header className="rounded-2xl bg-code px-6 py-8 sm:px-10 sm:py-10">
        <p className="font-mono text-xs tracking-wide text-code-green">
          LMCache · CPU device CI · vLLM main
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
          LMCache&apos;s CPU CI has been testing a frozen Sep&nbsp;23 vLLM wheel.
        </h1>
        <p className="mt-4 text-lg text-code-text">
          <code className="font-mono text-base text-code-green">vllm-cpu-nightly</code> stopped
          publishing, so CPU CI stays green while vLLM main now rejects the default{" "}
          <code className="font-mono text-base text-code-green">LMCacheMPConnector</code> config on
          CPU at startup. A small change to{" "}
          <code className="font-mono text-base text-code-green">kv_cache_access</code> brings it back,
          checked with your own e2e script.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={PR_URL}
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-light"
          >
            See the fix branch
          </a>
          <a
            href={ISSUE_6620}
            className="rounded-md border border-white/30 px-4 py-2.5 text-sm font-semibold text-white hover:border-white"
          >
            Issue #6620
          </a>
          <a
            href={DEMO_REPO}
            className="rounded-md border border-white/30 px-4 py-2.5 text-sm font-semibold text-white hover:border-white"
          >
            This page&apos;s repo and logs
          </a>
        </div>
      </header>

      <section className="mt-12" aria-labelledby="ab">
        <h2 id="ab" className="text-xl font-semibold text-ink">
          Same LMCache commit, same test, only vLLM changes
        </h2>
        <p className="mt-2 text-muted-dark">
          <code className="font-mono text-sm">.github/scripts/cpu_device_test.sh vllm_e2e</code>,
          opt-125m, LMCache <code className="font-mono text-sm">dev</code> @ bcafb03 (includes
          #6608), macOS arm64. Each cell is lmcache_driven / engine_driven (shm).
        </p>
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
          {matrix.map((row) => (
            <li
              key={row.vllm}
              className="grid gap-3 px-4 py-4 sm:grid-cols-[1.5fr_1fr_1fr] sm:items-center"
            >
              <div>
                <p className="font-mono text-[13px] text-ink">vLLM {row.vllm}</p>
                <p className="text-xs text-muted">{row.note}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted">dev today</p>
                <p className="mt-1 flex flex-wrap gap-1.5">
                  <Badge outcome={row.base[0]} />
                  <Badge outcome={row.base[1]} />
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted">dev + fix</p>
                <p className="mt-1 flex flex-wrap gap-1.5">
                  <Badge outcome={row.fixed[0]} />
                  <Badge outcome={row.fixed[1]} />
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-semibold text-bad">vLLM main, dev today</p>
            <p
              aria-label="Failure on vLLM main"
              className="rounded-lg bg-code p-4 font-mono text-[13px] leading-relaxed break-words text-code-text"
            >
              {failLine}
            </p>
          </div>
          <div className="min-w-0">
            <p className="mb-2 text-sm font-semibold text-good">vLLM main, dev + fix</p>
            <Code label="Pass on vLLM main with the fix">{passLines.join("\n")}</Code>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-dark">
          The same error stops the CPU-only quickstart command from the docs (Qwen3-0.6B). The{" "}
          <code className="font-mono">kv_cache_access</code> unit tests can&apos;t flag it in CPU CI
          either: on the frozen wheel, 11 of the 12 existing ones skip because it predates{" "}
          <code className="font-mono">KVCacheAccess</code>.
        </p>
      </section>

      <section className="mt-12" aria-labelledby="timeline">
        <h2 id="timeline" className="text-xl font-semibold text-ink">
          How the nightly froze
        </h2>
        <ol className="mt-4 border-l-2 border-line">
          {timeline.map((entry) => (
            <li key={entry.date} className="relative pb-5 pl-6 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute -left-[7px] top-1.5 size-3 rounded-full border-2 border-white bg-primary"
              />
              <p className="font-mono text-xs font-semibold text-primary">{entry.date}</p>
              <p className="mt-0.5 text-ink">
                {entry.text}{" "}
                <a href={entry.href} className="text-sm text-primary underline underline-offset-2">
                  source
                </a>
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12" aria-labelledby="fix">
        <h2 id="fix" className="text-xl font-semibold text-ink">
          The fix: follow vLLM&apos;s own platform rule
        </h2>
        <p className="mt-2 text-muted-dark">
          vLLM main only allows the extensible KV cache, which <code className="font-mono">EXPORTS_FD</code>{" "}
          needs, when <code className="font-mono">current_platform.is_cuda_alike()</code>. So when{" "}
          <code className="font-mono">use_vmm_api</code> is unset on any other platform, the connector
          declares <code className="font-mono">LEGACY_IPC</code> again, as it did before #6499. An explicit
          value is still honored. ROCm is CUDA-alike, so it&apos;s untouched and stays with #6626.
        </p>
        <div className="mt-4">
          <DiffBlock />
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-dark">
          <li>Unit tests: 15 pass on vLLM main (CPU); the 2 new non-CUDA-alike cases fail without the change.</li>
          <li>Their e2e on vLLM main and on the frozen wheel: 4 of 4 pass with the change.</li>
          <li>Not tested on CUDA, ROCm or XPU hardware; the CUDA branch is unchanged by construction.</li>
        </ul>
      </section>

      <section className="mt-12 rounded-lg bg-surface p-5" aria-labelledby="publisher">
        <h2 id="publisher" className="text-xl font-semibold text-ink">
          Restarting the canary needs a maintainer
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink">
          <li>
            Re-enable the <em>Nightly build &amp; publish vllm-cpu</em> workflow in LMCache/vllm-cpu
            (GitHub disabled it for inactivity).
          </li>
          <li>
            Add <code className="font-mono text-sm">--verbose</code> to the twine upload to see why
            PyPI returns 400. The project uses 8.27 GB across 199 files, under the 10 GB default cap,
            so size alone doesn&apos;t explain it.
          </li>
          <li>
            Optional: fail the nightly CPU verify when the installed wheel&apos;s build stamp is more
            than a few days old, so a frozen wheel can&apos;t read as a green night again.
          </li>
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="repro">
        <h2 id="repro" className="text-xl font-semibold text-ink">
          Reproduce it
        </h2>
        <div className="mt-3">
          <Code label="Reproduction commands">{reproCommands}</Code>
        </div>
      </section>

      <footer className="mt-16 border-t border-line pt-6 text-sm text-muted">
        Unofficial demo by Cheryl Aurelia: not affiliated with Tensormesh or LMCache. All results
        come from runs logged in this page&apos;s repo on Nov 14, 2026.
      </footer>
    </main>
  );
}
