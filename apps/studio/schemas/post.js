
export default {
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    {
      title: 'Category',
      type: 'string',
      name: 'filter',
      options: {
        list: [
          { title: 'Fact Sheet', value: 'fact' },
          { title: 'Press', value: 'press' },
        ],
      },
      validation: Rule => [Rule.required().error('Please set the type')],
    },
    {
      title: 'Language',
      type: 'string',
      name: 'language',
      options: {
        list: [
          { title: 'Français', value: 'fr' },
          { title: 'English', value: 'en' },
          { title: 'Les deux', value: 'all' },
        ],
      },
      validation: Rule => [Rule.required().error('Please set the language')],
    },
    {
      name: 'author',
      title: 'Author',
      type: 'string',
    },
    {
      name: 'source',
      title: 'Source Url',
      type: 'url',
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    },
    {
      name: 'contentfr',
      title: 'Content en Français',
      type: 'object',
      fields: [
        {
          name: 'titlefr',
          title: 'Title en Francais',
          type: 'string',
        },
        {
          name: 'slugfr',
          title: 'Slug',
          type: 'slug',
          options: {
            source: 'contentfr.titlefr',
            maxLength: 96,
          }
        },
        {
          name: 'bodyfr',
          title: 'Body en Français',
          type: 'blockContent',
        },
      ]
    },
    {
      name: 'contenten',
      title: 'Content in English',
      type: 'object',
      fields: [
        {
          name: 'titleen',
          title: 'Title in English',
          type: 'string',
        },
        {
          name: 'slugen',
          title: 'Slug',
          type: 'slug',
          options: {
            source: 'contenten.titleen',
            maxLength: 96,
          }
        },
        {
          name: 'bodyen',
          title: 'Body in English',
          type: 'blockContent',
        },
      ]
    },
  ],

  preview: {
    select: {
      title: 'publishedAt',
      subtitleFr: 'contentfr.titlefr',
      subtitleEn: 'contenten.titleen',
     
    },
    prepare(selection) {
      const {title, subtitleFr, subtitleEn} = selection
      const sub = () => {if(subtitleFr){
        return subtitleFr
      }
      else{
        return subtitleEn
      }}
      return {
        title: title.split('T')[0], // YYYY-MM-DD --> YYYY
        subtitle: sub(),
      }
    },
  },
}
