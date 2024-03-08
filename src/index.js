const os = require('os');
const { execSync } = require('child_process');
const core = require('@actions/core');

const ConnectedAppId = core.getInput('connected-app-id', { required: false });
const ConnectedAppSecret = core.getInput('connected-app-secret', { required: false });
const Username = core.getInput('username', { required: false });
const Password = core.getInput('password', { required: false });
const OrganizationId = core.getInput('organization-id', { required: true });

if (ConnectedAppId) {
  core.setSecret(ConnectedAppId);
  core.exportVariable('ANYPOINT_CONNECTED_APP_ID', ConnectedAppId);
}

if (ConnectedAppSecret) {
  core.setSecret(ConnectedAppSecret);
  core.exportVariable('ANYPOINT_CONNECTED_APP_SECRET', ConnectedAppSecret);
}

if (OrganizationId) {
  core.setSecret(OrganizationId);
  core.exportVariable('ANYPOINT_ORGANIZATION_ID', OrganizationId);
}

if (Username) {
  core.setSecret(Username);
  core.exportVariable('ANYPOINT_USERNAME', Username);
}

if (Password) {
  core.setSecret(Password);
  core.exportVariable('ANYPOINT_PASSWORD', Password);
}


execSync('curl https://sh.rustup.rs -sSf | sh -s -- -y', { stdio: 'inherit' });
execSync('rustup target add wasm32-wasi', { stdio: 'inherit' });
execSync('cargo install --locked cargo-generate', { stdio: 'inherit' });
execSync('npm install -g anypoint-cli-v4', { stdio: 'inherit' });

if (Username && Password) {
  execSync('anypoint-cli-v4 conf username $ANYPOINT_USERNAME', { stdio: 'inherit' });
  execSync('anypoint-cli-v4 conf password $ANYPOINT_PASSWORD', { stdio: 'inherit' });
} else if (ConnectedAppId && ConnectedAppSecret) {
  execSync('anypoint-cli-v4 conf client_id $ANYPOINT_CONNECTED_APP_ID', { stdio: 'inherit' });
  execSync('anypoint-cli-v4 conf client_secret $ANYPOINT_CONNECTED_APP_SECRET', { stdio: 'inherit' });
} else {
  throw new Error('No valid credentials set. Credentials are required to authenticate the Anypoint CLI. https://docs.mulesoft.com/anypoint-cli/latest/auth')
}

execSync('anypoint-cli-v4 conf organization $ANYPOINT_ORGANIZATION_ID', { stdio: 'inherit' });
execSync('anypoint-cli-v4 plugins:install anypoint-cli-pdk-plugin', { stdio: 'inherit' });