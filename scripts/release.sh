#!/bin/bash

set -ex
validate_tag='v[0-9].[0-9]+.[0-9]+$'

zip -r apps/extension/owallet-extension-${REF_NAME}.zip apps/extension/prod/ 

if [[ ${REF_NAME} =~ ${validate_tag} ]]; then
    gh release create ${REF_NAME} apps/extension/owallet-extension-${REF_NAME}.zip --title ${REF_NAME}
else 
    gh release create ${REF_NAME} apps/extension/owallet-extension-${REF_NAME}.zip --title ${REF_NAME} --prerelease
    echo "PRERELEASE=0" >> $GITHUB_ENV
fi