import { Cable, CircuitBoard, Disc3, HardDrive, MemoryStick, PlugZap, Usb, type LucideIcon } from 'lucide-react'

/** Icon for each lesson (1-based, like `lessons`). */
export const lessonIcons: Record<number, LucideIcon> = {
  1: PlugZap,
  2: CircuitBoard,
  3: MemoryStick,
  4: HardDrive,
  5: Disc3,
  6: Cable,
  7: Usb,
}
