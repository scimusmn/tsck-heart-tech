# Some notes on setting up this project on Linux.

1. `yarn` is an alias for `yarnpkg` on Linux, and therefore `yarn install:arduino-base` doesn't run because it attempts to use `sh` instead of `bash`.
2. If Firefox is set to clear cookies and cache on closing, Gatsby throws "Unhandled Rejection (SecurityError): The operation is insecure."
