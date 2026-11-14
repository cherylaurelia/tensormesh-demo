// Every value here comes from a log in /evidence or a linked public page.

export const REPO = "https://github.com/cherylaurelia/LMCache/tree/fix/cpu-kv-cache-access";
export const PR_URL = REPO;
export const DEMO_REPO = "https://github.com/cherylaurelia/tensormesh-demo";
export const ISSUE_6620 = "https://github.com/LMCache/LMCache/issues/6620";

export type TimelineEntry = {
  date: string;
  text: string;
  href: string;
};

export const timeline: readonly TimelineEntry[] = [
  {
    date: "Sep 17",
    text: "Last Linux x86_64 vllm-cpu-nightly wheel published (0.29.1.dev202609171111).",
    href: "https://pypi.org/project/vllm-cpu-nightly/#history",
  },
  {
    date: "Sep 18",
    text: "Linux build fails: vLLM's CPU kernels use the avx10.2 builtin, which GCC 12 on ubuntu-22.04 rejects.",
    href: "https://github.com/LMCache/vllm-cpu/actions/runs/35336201902",
  },
  {
    date: "Sep 23",
    text: "Last macOS wheel published (0.30.1.dev202609231158).",
    href: "https://pypi.org/project/vllm-cpu-nightly/#history",
  },
  {
    date: "Sep 24 →",
    text: "Both platforms build and pass twine check, then PyPI answers HTTPError: 400 on upload. The log doesn't show why.",
    href: "https://github.com/LMCache/vllm-cpu/actions",
  },
  {
    date: "Oct 4",
    text: "Last scheduled run. GitHub then disables the workflow for inactivity (state: disabled_inactivity).",
    href: "https://github.com/LMCache/vllm-cpu/actions",
  },
  {
    date: "Oct 30",
    text: "LMCache's nightly CPU verify issue shows it testing the September wheels; it closes the next day with “all platforms passed”.",
    href: "https://github.com/LMCache/LMCache/issues/6203",
  },
  {
    date: "Nov 13",
    text: "vLLM main breaks the connector twice (#6607 import, #6620 startup). People report both; the CPU canary stays green.",
    href: ISSUE_6620,
  },
];

export type Outcome = "pass" | "fail";

export type MatrixRow = {
  vllm: string;
  note: string;
  base: readonly [Outcome, Outcome];
  fixed: readonly [Outcome, Outcome];
};

export const matrix: readonly MatrixRow[] = [
  {
    vllm: "0.30.1.dev202609231158",
    note: "the vllm-cpu-nightly wheel CPU CI installs",
    base: ["pass", "pass"],
    fixed: ["pass", "pass"],
  },
  {
    vllm: "main @ 5e51c0c (Nov 14)",
    note: "built with LMCache/vllm-cpu's own macOS script, 5 min",
    base: ["fail", "fail"],
    fixed: ["pass", "pass"],
  },
];

export const failLine =
  "Value error, enable_extensible_kv_cache: a KV connector (e.g. LMCacheMPConnector with lmcache.mp.use_vmm_api) imports the KV cache through POSIX file descriptors, which needs it, but it is only supported on CUDA and ROCm.";

export const passLines: readonly string[] = [
  "✅ LMCache store verified (2 chunks written)",
  "✅ LMCache hit verified on same instance (2 chunks read)",
  "✅ LMCache hit verified after repopulation (2 chunks read)",
  "✅ LMCache cross-instance hit verified (2 chunks read)",
  "✅ All phases passed (Phase 1 + 2 + 3)",
];

export const fixDiff = `+from vllm.platforms import current_platform   # with the other vLLM imports
 ...
         if KVCacheAccess is None:
             return None
         extra_config = kv_transfer_config.kv_connector_extra_config
         if _USE_VMM_API_KEY in extra_config and not resolve_extra_config_value(
             extra_config, ExtraConfigDefault.use_vmm_api
         ):
             return KVCacheAccess.LEGACY_IPC
+        if (
+            _USE_VMM_API_KEY not in extra_config
+            and not current_platform.is_cuda_alike()
+        ):
+            # vLLM supports the extensible KV cache, which VMM exports need,
+            # only on CUDA and ROCm; declaring one elsewhere stops vLLM at
+            # startup.
+            return KVCacheAccess.LEGACY_IPC
         if resolve_extra_config_value(extra_config, ExtraConfigDefault.isolated_ipc):
             return KVCacheAccess.EXPORTS_FABRIC
         return KVCacheAccess.EXPORTS_FD`;

export const reproCommands = `# LMCache dev @ bcafb03, macOS arm64, Python 3.12
# (the script wants a token file even with SKIP_UPLOAD=1; any file works)
git clone https://github.com/LMCache/vllm-cpu && \\
  echo unused > /tmp/tok && SKIP_UPLOAD=1 PYPI_TOKEN_FILE=/tmp/tok bash vllm-cpu/scripts/build_and_publish_vllm_cpu_nightly_macos.sh
VLLM_CPU_NIGHTLY_SPEC=<built wheel> bash .github/scripts/install_vllm_cpu.sh
bash .github/scripts/install_lmcache_cpu.sh
LMCACHE_TRANSPORT_MODE=lmcache_driven \\
  bash .github/scripts/cpu_device_test.sh vllm_e2e`;
