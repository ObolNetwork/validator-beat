import { Box, Text } from "@obolnetwork/obol-ui";
import type { GetStaticPaths, GetStaticProps } from "next";

type OperatorPageProps = {
  slug: string;
  name: string;
};

export default function OperatorProfilePage({ slug, name }: OperatorPageProps) {
  return (
    <Box css={{ display: "flex", flexDirection: "column", gap: "$lg" }}>
      <Text variant="h3" css={{ color: "$body" }}>
        {name}
      </Text>
      <Text variant="body" css={{ color: "$muted" }}>
        Profile for <code>{slug}</code> — six-slice pizza and stage breakdown
        ship in Phase 1.
      </Text>
    </Box>
  );
}

const PLACEHOLDER_OPERATORS = [{ slug: "example", name: "Example Operator" }];

export const getStaticPaths: GetStaticPaths = () => ({
  paths: PLACEHOLDER_OPERATORS.map(({ slug }) => ({
    params: { slug },
  })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<OperatorPageProps> = ({
  params,
}) => {
  const slug = params?.slug as string;
  const operator = PLACEHOLDER_OPERATORS.find((o) => o.slug === slug);

  if (!operator) {
    return { notFound: true };
  }

  return {
    props: {
      slug: operator.slug,
      name: operator.name,
      title: operator.name,
      description: `Validator Beat profile for ${operator.name}.`,
    },
  };
};
