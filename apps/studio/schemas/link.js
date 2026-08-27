import { LinkIcon } from '@sanity/icons';
import { JsonView } from '../components/views/JsonView';
import { DocumentIcon } from '@sanity/icons';
import S from '@sanity/desk-tool/structure-builder';

export default {
  title: 'Link',
  name: 'link',
  type: 'document',
  icon: LinkIcon,
  fields: [
    {
      title: 'Name - Francais',
      name: 'fr',
      type: 'string',
    },
    {
      title: 'Name - English',
      name: 'en',
      type: 'string',
    },
    {
      title: 'URL',
      name: 'link',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'fr',
      subtitle: 'link',
    },
  },
  views: [S.view.component(JsonView).title('JSON').icon(DocumentIcon)],
};
