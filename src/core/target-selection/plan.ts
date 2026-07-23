import type { AllowedToolId } from '@/constants/index.js';

export type TargetAssetItem = {
    id: string;
    name?: string;
    supportedTargets?: readonly (AllowedToolId | string)[];
};

export type TargetAssetPlan<TAsset extends TargetAssetItem> = {
    targetId: AllowedToolId | string;
    assetIds: string[];
    assets: TAsset[];
};

export const filterCompatibleAssets = <TAsset extends TargetAssetItem>(
    assets: readonly TAsset[],
    targetId: AllowedToolId | string,
): TAsset[] => {
    return assets.filter((asset) => {
        if (!asset.supportedTargets || !asset.supportedTargets.length) return true;
        return asset.supportedTargets.includes(targetId as AllowedToolId);
    });
};

export const createTargetAssetPlan = <TAsset extends TargetAssetItem>(
    targetIds: readonly (AllowedToolId | string)[],
    assets: readonly TAsset[],
    targetAssetMap: Record<string, readonly string[]>,
): TargetAssetPlan<TAsset>[] => {
    const plans: TargetAssetPlan<TAsset>[] = [];

    for (const targetId of targetIds) {
        const compatible = filterCompatibleAssets(assets, targetId);
        const requestedIds = targetAssetMap[targetId] ?? [];

        const selectedAssets: TAsset[] = [];
        for (const reqId of requestedIds) {
            const found = compatible.find((a) => a.id === reqId);
            if (!found) {
                const assetExists = assets.some((a) => a.id === reqId);
                if (assetExists) {
                    throw new Error(`Asset '${reqId}' is not compatible with target '${targetId}'.`);
                } else {
                    throw new Error(`Unknown asset '${reqId}'.`);
                }
            }
            selectedAssets.push(found);
        }

        plans.push({
            targetId,
            assetIds: selectedAssets.map((a) => a.id),
            assets: selectedAssets,
        });
    }

    return plans;
};

export const formatMissingArgumentError = (
    missingThing: 'target' | 'asset' | 'positional' | 'option',
    details: {
        requiredArg?: string;
        optionFlag?: string;
        validValues?: readonly string[];
    },
): string => {
    const parts: string[] = [];
    if (details.requiredArg) {
        parts.push(`Missing required positional argument '${details.requiredArg}'.`);
    }
    if (details.optionFlag) {
        parts.push(`Specify using ${details.optionFlag}.`);
    }
    if (details.validValues?.length) {
        parts.push(`Valid values: ${details.validValues.join(', ')}.`);
    }
    return parts.join(' ');
};
