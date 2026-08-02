import ConfirmDialog from "../ui/ConfirmDialog"

interface UnsavedChangesDialogProps {
  open: boolean
  onDiscard: () => void
  onKeepEditing: () => void
}

export default function UnsavedChangesDialog({
  open,
  onDiscard,
  onKeepEditing,
}: UnsavedChangesDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Alterações não salvas"
      description="Você tem alterações que ainda não foram salvas. Deseja descartá-las?"
      confirmLabel="Descartar alterações"
      cancelLabel="Continuar editando"
      variant="danger"
      onConfirm={onDiscard}
      onCancel={onKeepEditing}
    />
  )
}
