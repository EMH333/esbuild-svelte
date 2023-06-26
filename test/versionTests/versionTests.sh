#!/bin/bash

# Test esbuild and svelte versions for compability using the example-js project files

# cd to script directory
cd "$(dirname "$0")" || exit

# copy esbuild-svelte to destination
cp ../../dist/index.js .

npm init -y || exit

# array of versions
ESBUILD_VERSIONS=("0.9.6" "0.16.17" "0.18.10")
SVELTE_VERSIONS=("3.43.0" "3.59.2" "4.0.0")

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
rm index.js package.json package-lock.json
rm -r dist/ node_modules/
