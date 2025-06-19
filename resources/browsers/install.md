#  Baidu&Bing search support for

for baidu and bing search support on client



##  Installation

before to package,run this commond in project root directory:

```
npx playwright install chromium
```

##  Copy

move chromium to project resources

for Mac:

```
cp -r ~/Library/Caches/ms-playwright/chromium_headless_shell-*/* resources/browsers/chromium/
```

for windows:

```
xcopy %USERPROFILE%\AppData\Local\ms-playwright\chromium_headless_shell-* resources\browsers\chromium /E /I
```

and complie your project