import Head from 'next/head';

// Structured data is the only thing on this site that Google reads and a
// visitor never sees, so it is kept in one shape: a graph node, serialised,
// under a key so `next/head` keeps one script per node rather than the last one
// mounted.
function JsonLd({ id, data }) {
  return (
    <Head>
      <script
        key={id}
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    </Head>
  );
}

export default JsonLd;
