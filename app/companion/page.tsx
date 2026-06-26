import Companion from "@/components/Companion";
import { SectionHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ask the sky | Anwa" };

export default function CompanionPage() {
  const live = Boolean(process.env.ANTHROPIC_API_KEY);
  return (
    <div className="py-14">
      <SectionHeader
        index="06"
        kicker="Ask the sky"
        title="A companion who knows this sky"
        lead="Ask anything about a night at Al Qua'a and the companion answers from the real sky and the real host families: the best nights to come, what you will see and its old Arabic names, and which family to stay with. It works things out, it does not guess."
      />
      <Companion live={live} />
    </div>
  );
}
