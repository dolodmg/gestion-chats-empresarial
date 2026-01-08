import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
}

export default function AlertDialog({ isOpen, onClose, title, message, type = 'info' }: AlertDialogProps) {
    if (!isOpen) return null;

    const icons = {
        success: <CheckCircle className="w-12 h-12 text-green-500" />,
        error: <AlertCircle className="w-12 h-12 text-red-500" />,
        info: <Info className="w-12 h-12 text-blue-500" />
    };

    const colors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        info: 'bg-blue-50 border-blue-200'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${colors[type]}`}>
                    <div className="flex items-center gap-3">
                        {icons[type]}
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
                <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}
