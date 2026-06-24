/**
 * Подпись легенды ограничений по presentationMode (ключи совпадают с restrictionCellPresentationModes).
 */
// eslint-disable-next-line import/prefer-default-export
export function resolvePresentationRestrictionCaption({
  presentationMode,
  modes,
  hasCurrentTariffSomeDependedRestrictions,
}) {
  const {
    restrictionCellNonePresentationMode,
    restrictionCellManualPresentationMode,
    restrictionCellCopiedPresentationMode,
    restrictionCellClosedPresentationMode,
  } = modes;

  if (presentationMode === restrictionCellNonePresentationMode) {
    return { captionKey: "нет ограничений" };
  }
  if (presentationMode === restrictionCellManualPresentationMode) {
    return { captionKey: hasCurrentTariffSomeDependedRestrictions ? "ручное" : "ограничения" };
  }
  if (presentationMode === restrictionCellCopiedPresentationMode) {
    return { captionKey: "скопированное" };
  }
  if (presentationMode === restrictionCellClosedPresentationMode) {
    return { captionKey: "продажа закрыта" };
  }
  return { captionKey: "ограничения" };
}
