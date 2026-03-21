import { useEffect, useState } from "react";
import { useGameContext } from "./useGameContext";
import { AnswerVote, GamePhase } from "~/supabase/types";
import { supabase } from "~/supabase/client";

type VotesByAnswer = Record<
    string,
    { total: number; accepted: number; rejected: number }
>;

export function useAnswersVotes() {
    const { game, answers } = useGameContext();

    const [answersVotes, setAnswersVotes] = useState<AnswerVote[]>([]);
    const [votesByAnswer, setVotesByAnswer] = useState<VotesByAnswer>({});

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!game || !answers) {
            setIsLoading(false);
            return;
        }

        const answerIds = answers.map((answer) => answer.id);

        const getAnswersVotes = async () => {
            const { data } = await supabase
                .from("answer_votes")
                .select("*")
                .in("answer_id", answerIds);

            setAnswersVotes(data ?? []);
            setIsLoading(false);
        };

        getAnswersVotes();

        const channel = supabase.channel(
            `answer_votes:${game.id}:${game.round_number}`,
        );

        channel
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "answer_votes",
                    filter: `answer_id=in.(${answerIds.join(",")})`,
                },
                () => getAnswersVotes(),
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [game, answers]);

    useEffect(() => {
        if (!answersVotes) {
            return;
        }

        const newVotesByAnswer: VotesByAnswer = {};

        for (const answer of answers) {
            newVotesByAnswer[answer.id] = {
                total: 0,
                accepted: 0,
                rejected: 0,
            };
        }

        for (const vote of answersVotes) {
            const answerId = vote.answer_id;
            const value = vote.value;

            if (!newVotesByAnswer[answerId]) {
                continue;
            }

            newVotesByAnswer[answerId].total++;
            newVotesByAnswer[answerId][value ? "accepted" : "rejected"]++;
        }

        setVotesByAnswer(newVotesByAnswer);
    }, [answers, answersVotes]);

    return { answersVotes, isLoading, votesByAnswer };
}
