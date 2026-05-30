interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

/**
 * 通用确认弹窗。
 *
 * - confirmDestructive=true 时确认按钮为红色（删除/清空等危险操作）
 * - disabled 可禁用确认按钮
 */
export function ConfirmModal({
  open,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  confirmDestructive = false,
  onConfirm,
  onCancel,
  disabled = false,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75">
      <div className="w-[92%] max-w-sm rounded-[20px] bg-zinc-900/95 border border-white/10 shadow-2xl p-5">
        <div className="text-white font-semibold text-lg">{title}</div>
        <div className="text-sm text-zinc-400 mt-2 leading-relaxed">{description}</div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-zinc-950/40 border border-white/10 text-white/90 hover:bg-zinc-950/60 transition-colors text-sm font-semibold"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            className={
              confirmDestructive
                ? "px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-100 hover:bg-red-500/20 transition-colors text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                : "px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/15 transition-colors text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            }
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
