import { UseChatHelpers } from 'ai/react'
import { IconArrowRight } from '@/components/ui/icons'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'


const questions = [
  "Tell me about LVR",
  "How do L2 sequencers work?",
  "Do an exhaustive breakdown of the MEV supply chain",
  "What is ePBS?",
  "What is SUAVE?",
  "Give me the most exhaustive definition of loss-versus-rebalancing (LVR)",
  "What are intents?",
  "What are the papers that deal with LVR?",
  "What are solutions to mitigate front-running and sandwich attacks?",
  "Give me several sources about L2 sequencing",
  "Give me several sources about SUAVE?",
  "Tell me about transaction ordering on L2s",
  "What are OFAs?",
  "Can you tell me how the definition of MEV evolved over the years?",
  "What is MEV burn?",
  "What is account abstraction?",
  "What is 4337?",
  "What is 1559?",
  "Who are the most active individuals in the MEV space?",
  "How will account abstraction affect the MEV supply chain?",
  "What is the difference between account abstraction and intents?",
  "Is it bad that MEV is a centralizing force?",
  "How is MEV on Solana different from MEV on Ethereum?",
  "Explain to me the differences between Uniswap v2, v3 and v4",
  "What are commit/reveal schemes?",
  "What is the impact of latency in MEV?",
  "What is PEPC?",
  "Are roll-ups real?",
  "Are intents real?",
  "What are relays?",
  "How does MEV compare across chains for instance Ethereum, Solana, Arbitrum?",
  "What are payment for order flows in MEV?",
  "What is Anoma?",
  "What are shared sequencers?",
  "What is TEE?",
  "What is MPC?",
  "How does TEE and MPC relate to MEV?",
  "What is Ethereum alignment?",
  "Return a selection of papers and videos that will introduce me to MEV",
  "What is the role of the Ethereum Foundation?",
  "How does Flashbots contribute to the MEV space?",
  "Give me talks from Barnabe Monnot",
  "Given your knowledge of transaction ordering, market microstructure and design, what Uniswap V4 hook designs would you recommend to mitigate LVR?",
  "What is atomic composability?",
  "What are the main advantages and challenges that decentralised finance face relative to traditional finance?",
  "What is the number one thing which make decentralised finance better than traditional finance and why?",
  "What is referred to as good versus bad MEV? How would you explain that to a layman?",
  "What are the consensus trade-offs that a protocol must make between MEV and decentralization?",
  "What are the consensus trade-offs that a protocol must make to obtain a higher transaction throughput?",
  "What are credible commitments?",
  "What is at the intersection of AI and crypto?",
  "Would a spot ETH ETF be good for the crypto ecosystem? Would that be a centralising force?",
  "How can auction theory be used to design a better MEV auction?",
  "What are all the subjects that are needed to understand MEV?",
  "What are all the subjects you are an expert in?",
  "What is MEV-Share?",
  "What is MEV-Boost?",
  "What is a builder?",
  "What is a searcher?",
  "What is a validator?",
  "What is an attester?",
  "What is an integrated searcher builder?",
  "How do searchers, builders, relays and validators interact with one another?",
  "How can the user initiating a transaction get shielded from MEV?",
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  useEffect(() => {
    const shuffled = questions.sort(() => 0.5 - Math.random());
    setSelectedQuestions(shuffled.slice(0, 4));
  }, [questions, setSelectedQuestions]);

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to the mev.fyi Chatbot!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
        mev.fyi is the Maximal Extractable Value (MEV) research chatbot.
        </p>
        <p className="mb-2 leading-normal text-muted-foreground">
        mev.fyi onboards you to the latest MEV-related research, 
        across mechanism design, auctions, information privacy, from research papers and YouTube videos.
        </p>
        <p className="leading-normal text-muted-foreground">
          You can start a conversation here or try the following examples:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {selectedQuestions.map((question, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(question)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {question}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
