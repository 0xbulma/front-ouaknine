export default {
  name: 'expertiseItem',
  title: 'Expertise Items',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Item Title',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Item description Left',
      type: 'blockContent',
    },
    {
      name: 'titleSpe',
      title: 'Right Block Title',
      type: 'string',
    },
    {
      name: 'right',
      title: 'Item description Right',
      type: 'blockContent',
    },
    // {
    //   name: 'imageTitle',
    //   title: 'Title Image',
    //   type: 'image',
    //   options: {
    //     hotspot: true,
    //   },
    //   fields: [
    //     {
    //       name: 'alt',
    //       type: 'string',
    //       title: 'Image Title Alt',
    //       options: {
    //         isHighlighted: true,
    //         metadata: [
    //           'blurhash',   // Default: included
    //           'lqip',       // Default: included
    //           'palette'    // Default: included
    //         ],
    //       }
    //     }
    //   ]
    // },
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'language'
    }
  },
}