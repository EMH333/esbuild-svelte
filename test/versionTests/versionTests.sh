#!/bin/bash

# Test esbuild and svelte versions for compability using the example-js project files

# cd to script directory
cd "$(dirname "$0")" || exit

# copy esbuild-svelte to destination
cp ../../dist/index.mjs .

npm init -y || exit
npm pkg set type="module" || exit

# array of versions
ESBUILD_VERSIONS=("0.17.19" "0.18.10" "0.19.2" "0.21.3" "0.24.0")
SVELTE_VERSIONS=("4.2.1" "5.0.3" "5.1.3")

# loop through versions
for ESBUILD_VERSION in "${ESBUILD_VERSIONS[@]}"
do
  for SVELTE_VERSION in "${SVELTE_VERSIONS[@]}"
  do
    echo "Testing esbuild@$ESBUILD_VERSION and svelte@$SVELTE_VERSION"

    # install esbuild and svelte versions
    npm install esbuild@"$ESBUILD_VERSION" svelte@"$SVELTE_VERSION" || exit

    # run test script
    node test.js "$ESBUILD_VERSION" "$SVELTE_VERSION" || exit
  done
done

# remove temp files
rm index.mjs package.json package-lock.json
rm -r dist/ node_modules/
