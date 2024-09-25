import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Document {
  'id' : DocumentId,
  'revisions' : BigUint64Array | bigint[],
  'projects' : BigUint64Array | bigint[],
  'currentVersion' : bigint,
}
export type DocumentId = bigint;
export interface DocumentRevision {
  'id' : DocumentRevisionId,
  'title' : string,
  'content' : Uint8Array | number[],
  'author' : Principal,
  'version' : bigint,
  'timestamp' : bigint,
  'documentId' : DocumentId,
}
export type DocumentRevisionId = bigint;
export interface Project {
  'id' : ProjectId,
  'documents' : BigUint64Array | bigint[],
  'name' : string,
  'author' : Principal,
  'timestamp' : bigint,
}
export type ProjectId = bigint;
export interface _SERVICE {
  'create_document' : ActorMethod<
    [ProjectId, string, Uint8Array | number[]],
    DocumentId
  >,
  'create_document_revision' : ActorMethod<
    [ProjectId, DocumentId, string, Uint8Array | number[]],
    DocumentRevisionId
  >,
  'create_project' : ActorMethod<[string], ProjectId>,
  'diff_document_revisions' : ActorMethod<
    [DocumentRevisionId, DocumentRevisionId],
    Array<DocumentRevision>
  >,
  'list_all_documents' : ActorMethod<[], Array<Document>>,
  'list_document_revisions' : ActorMethod<
    [DocumentId],
    Array<DocumentRevision>
  >,
  'list_documents' : ActorMethod<[ProjectId], Array<Document>>,
  'list_projects' : ActorMethod<[], Array<Project>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
