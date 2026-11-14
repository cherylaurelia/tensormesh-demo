# LMCache's CPU CI has been testing a frozen Sep 23 vLLM wheel

Unofficial demo by Cheryl Aurelia: not affiliated with Tensormesh or LMCache.

## The problem
- `vllm-cpu-nightly`, the wheel LMCache's CPU device CI installs (`.github/scripts/install_vllm_cpu.sh`), has not published since 2026-09-23 (macOS) / 2026-09-17 (Linux). In [LMCache/vllm-cpu's Actions](https://github.com/LMCache/vllm-cpu/actions), uploads fail with PyPI `HTTPError: 400` from 2026-09-24, and the workflow is `disabled_inactivity` after 2026-10-04.
- LMCache's nightly CPU verify still reported "all platforms passed" on those wheels ([#6203](https://github.com/LMCache/LMCache/issues/6203)).
- On vLLM main, the default `LMCacheMPConnector` config now stops vLLM at startup on CPU ([#6620](https://github.com/LMCache/LMCache/issues/6620)). LMCache's own `cpu_device_test.sh vllm_e2e` fails in both transfer modes, while the same test passes on the frozen wheel.

## The fix
Branch [`cherylaurelia/LMCache@fix/cpu-kv-cache-access`](https://github.com/cherylaurelia/LMCache/tree/fix/cpu-kv-cache-access): when `lmcache.mp.use_vmm_api` is unset and `current_platform.is_cuda_alike()` is false, `kv_cache_access()` declares `LEGACY_IPC` (pre-#6499 behavior), following vLLM's own rule. ROCm is untouched (#6626).

## Evidence
`evidence/` holds the e2e logs (home paths replaced with `~`):
- `e2e-matrix.txt`: every run, with its exit code.
- `lmc-main-*.out.txt`: vLLM main, `dev` today (fails).
- `fix-*-lmc-main-*.out.txt`: vLLM main with the fix (passes, all 3 phases).
- `lmc-venv-*` / `fix-lmc-venv-*`: the frozen wheel.

Setup: LMCache `dev` bcafb03, macOS arm64, Python 3.12, opt-125m. vLLM main 5e51c0c was built with LMCache/vllm-cpu's `scripts/build_and_publish_vllm_cpu_nightly_macos.sh` (`SKIP_UPLOAD=1`).

## Run the page
```
npm install
npm run build && npm run start
```
