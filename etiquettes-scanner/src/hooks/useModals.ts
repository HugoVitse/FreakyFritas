import { useCallback, useState } from 'react';

export function useModals() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [blModalOpen, setBlModalOpen] = useState(false);
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [quantityModalProduct, setQuantityModalProduct] = useState<
    string | null
  >(null);
  const [quantityInput, setQuantityInput] = useState<string>('1');
  const [bottomPanelCollapsed, setBottomPanelCollapsed] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const openQuantityModal = useCallback((productName: string) => {
    setQuantityModalProduct(productName);
    setQuantityInput('1');
    setQuantityModalOpen(true);
  }, []);

  const closeQuantityModal = useCallback(() => {
    setQuantityModalOpen(false);
    setQuantityModalProduct(null);
    setQuantityInput('1');
  }, []);

  return {
    historyOpen,
    setHistoryOpen,
    blModalOpen,
    setBlModalOpen,
    quantityModalOpen,
    setQuantityModalOpen,
    quantityModalProduct,
    setQuantityModalProduct,
    quantityInput,
    setQuantityInput,
    bottomPanelCollapsed,
    setBottomPanelCollapsed,
    expandedIndex,
    setExpandedIndex,
    openQuantityModal,
    closeQuantityModal,
  };
}
