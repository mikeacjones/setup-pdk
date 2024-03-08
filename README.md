## Configure PDK CLI Tools for GitHub Actions
Configures and installs CLI tools necessary for building and publishing [PDK (Policy Development Kit)](https://docs.mulesoft.com/pdk/latest/policies-pdk-overview) policies built for MuleSoft Flex Gateway.

For more information about the tools being installed by this action, see [PDK Prerequisites](https://docs.mulesoft.com/pdk/latest/policies-pdk-prerequisites)

## Overview
In order to use the PDK plugin for the Anypoint CLI v4, you need to install a series of [prerequisites](https://docs.mulesoft.com/pdk/latest/policies-pdk-prerequisites). This action allows you to build and publish PDK based policies by installing the Anypoint CLI, PDK plugin, and configuring CLI credentials.

## Usage


The following table describes available authentication methods. For more information, see [Authentication to the Anypoint Platform CLI](https://docs.mulesoft.com/anypoint-cli/latest/auth). Checkbox indicates required inputs for action.
| **Identity Used**              | `connected-app-id` | `connected-app-secret` | `username` | `password` |
| ------------------------------ | ------------------ | ---------------------- | ---------- | ---------- |
| [Recommended] Connected App    | ✔                  | ✔                      |            |            |
| User/Service Account           |                    |                        | ✔          | ✔          |

Input `organization-id` required for all authentication methods.

For more information, see [action.yml](./action.yml)


Example:

```yaml
name: build-and-publish
on:
  push:
  
jobs:
  build-and-publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: PDK Setup
        uses: mikeacjones/setup-pdk@v1
        with:
          connected-app-id: ${{ secrets.CONNECTED_APP_ID }}
          connected-app-secret: ${{ secrets.CONNECTED_APP_SECRET }}
          organization-id: ${{ secrets.ORGANIZATION_ID }}
      - name: Set organization ID in TOML
        env:
          ORGANIZATION_ID: ${{ secrets.ORGANIZATION_ID }}
        run: sed -i "s/ORGANIZATION_ID/$ORGANIZATION_ID/g" ./Cargo.toml
      ## Make setup required to be run prior to other commands
      - name: Make Setup
        run: make setup
      ## Make publish pushes a DEV version of the policy to the Exchange
      ## DEV policies automatically have the current datetime appended to the semantic
      ## version in format #.#.#-YYYYMMDDHHMMSS removing need to change version in Cargo.toml
      - name: Publish DEV
        if: ${{ github.ref != 'refs/heads/main' }}
        run: make publish
      ## Make release pushes a Release version of the policy to the Exchange
      ## Version in Cargo.toml must be unique or Exchange will return a 429 indicating a conflict
      ## with existing version
      - name: Publish Release
        if: ${{ github.ref == 'refs/heads/main' }}
        run: make release
```