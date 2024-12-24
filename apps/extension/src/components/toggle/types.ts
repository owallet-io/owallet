export interface ToggleProps {
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  disabled?: boolean;
  height?: number;
  width?: number;
}
