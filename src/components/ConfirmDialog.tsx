import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'warning'
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const variants = {
        danger: {
            icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
            headerBg: 'bg-red-50 border-red-200',
            confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        },
        warning: {
            icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
            headerBg: 'bg-amber-50 border-amber-200',
            confirmBtn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
        },
        info: {
            icon: <AlertTriangle className="w-12 h-12 text-blue-500" />,
            headerBg: 'bg-blue-50 border-blue-200',
            confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }
    };

    const style = variants[variant];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${style.headerBg}`}>
                    <div className="flex items-center gap-3">
                        {style.icon}
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-white/50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-700">{message}</p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:ring-2 focus:ring-offset-2 ${style.confirmBtn}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
