export const idlFactory = ({ IDL }) => {
  const ProjectId = IDL.Nat64;
  const DocumentId = IDL.Nat64;
  const DocumentRevisionId = IDL.Nat64;
  const Document = IDL.Record({
    'id' : DocumentId,
    'revisions' : IDL.Vec(DocumentRevisionId),
    'projects' : IDL.Vec(ProjectId),
    'currentVersion' : IDL.Nat64,
  });
  const DocumentRevision = IDL.Record({
    'id' : DocumentRevisionId,
    'title' : IDL.Text,
    'content' : IDL.Vec(IDL.Nat8),
    'author' : IDL.Principal,
    'version' : IDL.Nat64,
    'timestamp' : IDL.Nat64,
    'documentId' : DocumentId,
  });
  const Project = IDL.Record({
    'id' : ProjectId,
    'documents' : IDL.Vec(DocumentId),
    'name' : IDL.Text,
    'author' : IDL.Principal,
    'timestamp' : IDL.Nat64,
  });
  return IDL.Service({
    'create_document' : IDL.Func(
        [ProjectId, IDL.Text, IDL.Vec(IDL.Nat8)],
        [DocumentId],
        [],
      ),
    'create_document_revision' : IDL.Func(
        [ProjectId, DocumentId, IDL.Text, IDL.Vec(IDL.Nat8)],
        [DocumentRevisionId],
        [],
      ),
    'create_project' : IDL.Func([IDL.Text], [ProjectId], []),
    'list_all_documents' : IDL.Func([], [IDL.Vec(Document)], ['query']),
    'list_document_revisions' : IDL.Func(
        [DocumentId],
        [IDL.Vec(DocumentRevision)],
        ['query'],
      ),
    'list_documents' : IDL.Func([ProjectId], [IDL.Vec(Document)], ['query']),
    'list_projects' : IDL.Func([], [IDL.Vec(Project)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
