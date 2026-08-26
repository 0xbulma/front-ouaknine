import Head from 'next/head';

// Structured data is the only thing on this site that Google reads and a
// visitor never sees, so it is kept in one shape: a graph node, serialised,
// under a key so `next/head` keeps one script per node rather than the last one
// mounted.
function JsonLd({ id, data }: { id: string; data: unknown }) {
  return (
    <Head>
      <script
        key={id}
        type='application/ld+json'
        // `</script>` inside CMS prose would otherwise close this element and
        // the rest would parse as HTML. \u003c is valid JSON and identical to a
        // parser.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data).replace(/</g, '\\u003c'),
        }}
      />
    </Head>
  );
}

export default JsonLd;
