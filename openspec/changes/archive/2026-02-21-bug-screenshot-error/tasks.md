## 1. Supreme Module

- [x] 1.1 Add `waitForSelector` for `.fancybox-content` with `visible: true` and 15s timeout after navigation
- [x] 1.2 Add `waitForFunction` to wait for image load (`img.complete && img.naturalWidth > 0`) with 15s timeout
- [x] 1.3 Add 300ms render buffer before screenshot
- [x] 1.4 Wrap new waits in try/catch to fall back gracefully on timeout

## 2. Palace Module

- [x] 2.1 Add `waitForSelector` for `.fancybox-content` with `visible: true` and 15s timeout after navigation
- [x] 2.2 Add `waitForFunction` to wait for image load with 15s timeout
- [x] 2.3 Add 300ms render buffer before screenshot
- [x] 2.4 Wrap new waits in try/catch to fall back gracefully on timeout

## 3. Verification

- [ ] 3.1 Test Supreme screenshot captures loaded gallery image
- [x] 3.2 Test Palace screenshot captures loaded gallery image
- [x] 3.3 Verify fallback behavior when fancybox doesn't appear
