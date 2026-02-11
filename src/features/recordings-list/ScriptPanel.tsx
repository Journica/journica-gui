import { ReactNode } from "react";
import { Entry } from "./useEntries";

interface Props {
  selectedEntry: Entry | null;
  highlightedTranscript: ReactNode;
  scriptMessage: string | null;
}

export function ScriptPanel({ selectedEntry, highlightedTranscript, scriptMessage }: Props) {
  return (
    <section className="flex-1 overflow-y-auto p-6 bg-white">
      <h2 className="text-lg font-bold mb-3">Script</h2>
      {scriptMessage && <p className="text-gray-500">{scriptMessage}</p>}
      {selectedEntry?.transcript && <p className="whitespace-pre-wrap leading-relaxed">{highlightedTranscript}</p>}
    </section>
  );
}
