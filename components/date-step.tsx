import { Input } from "@/components/ui/input";

interface DateStepProps {
  selectedDate: string;
  onChange: (date: string) => void;
}

export function DateStep({
  selectedDate,
  onChange,
}: DateStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        What day are we planning?
      </h2>

      <Input
        type="date"
        value={selectedDate}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
