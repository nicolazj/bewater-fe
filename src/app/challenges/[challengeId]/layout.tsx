import { getChallengeById } from '@/services/challenge';
import { ChallengeHero } from './hero';
import { ChallengeNav } from './nav';
import { segmentSchema } from './param-schema';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { challengeId: string };
}) {
  const { challengeId } = segmentSchema.challengeId.parse(params);
  // fix me .seems like nextjs bug
  if (challengeId === '%5BchallengeId%5D') return null;
  const challenge = await getChallengeById(challengeId);
  return (
    <div>
      <ChallengeHero challenge={challenge} />
      <ChallengeNav challengeId={params.challengeId} />
      <div>{children}</div>
    </div>
  );
}
