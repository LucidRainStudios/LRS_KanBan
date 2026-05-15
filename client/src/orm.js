import { ORM } from 'redux-orm';

import { Activity, Attachment, Board, BoardMembership, Card, CardLink, Core, Label, List, Notification, Priority, Project, ProjectManager, Task, User, UserPrefs } from './models';

const orm = new ORM({
  stateSelector: (state) => state.orm,
});

orm.register(User, UserPrefs, Project, ProjectManager, Board, BoardMembership, Label, List, Card, Core, Task, Attachment, Activity, Notification, Priority, CardLink);

export default orm;
