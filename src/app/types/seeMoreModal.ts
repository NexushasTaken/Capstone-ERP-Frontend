export interface SeeMoreModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}