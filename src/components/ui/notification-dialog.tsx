import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface NotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  details?: Record<string, string>;
  type?: 'success' | 'warning';
}

export function NotificationDialog({ isOpen, onClose, title, details, type = 'success' }: NotificationDialogProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center gap-3">
                  {type === 'success' ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  ) : (
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                  )}
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {title}
                  </Dialog.Title>
                </div>

                {details && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(details).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="font-semibold">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      type === 'success'
                        ? 'bg-blue-100 text-blue-900 hover:bg-blue-200 focus-visible:ring-blue-500'
                        : 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200 focus-visible:ring-yellow-500'
                    }`}
                    onClick={onClose}
                  >
                    Đóng
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 