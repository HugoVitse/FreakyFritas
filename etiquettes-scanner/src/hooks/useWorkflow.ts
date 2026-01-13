import { useCallback, useState } from 'react';
import { WorkflowStep, Mode } from '../types';

interface UseWorkflowProps {
  onWorkflowChange?: (step: WorkflowStep) => void;
}

export function useWorkflow({ onWorkflowChange }: UseWorkflowProps = {}) {
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('home');

  const handleSetStep = useCallback(
    (step: WorkflowStep) => {
      setWorkflowStep(step);
      onWorkflowChange?.(step);
    },
    [onWorkflowChange]
  );

  const startNewDelivery = useCallback(() => {
    handleSetStep('bl-scan');
  }, [handleSetStep]);

  const goToLabelsScan = useCallback(() => {
    handleSetStep('labels-scan');
  }, [handleSetStep]);

  const goToSummary = useCallback(() => {
    handleSetStep('summary');
  }, [handleSetStep]);

  const finishDelivery = useCallback(() => {
    handleSetStep('home');
  }, [handleSetStep]);

  return {
    workflowStep,
    startNewDelivery,
    goToLabelsScan,
    goToSummary,
    finishDelivery,
  };
}
