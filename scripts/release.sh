#!/bin/bash

set -ex
validate_tag='v[0-9].[0-9]+.[0-9]+$'

zip -r packages/extension/owallet-extension-${REF_NAME}.zip packages/extension/prod/ 

if [[ ${REF_NAME} =~ ${validate_tag} ]]; then
    gh release create ${REF_NAME} packages/extension/owallet-extension-${REF_NAME}.zip --title ${REF_NAME}
else 
    gh release create ${REF_NAME} packages/extension/owallet-extension-${REF_NAME}.zip --title ${REF_NAME} --prerelease
    echo "PRERELEASE=0" >> $GITHUB_ENV
fi