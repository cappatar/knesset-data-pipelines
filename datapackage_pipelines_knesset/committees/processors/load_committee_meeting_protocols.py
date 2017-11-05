from datapackage_pipelines_knesset.common.base_processors.add_resource import AddResourceBaseProcessor
from sqlalchemy import or_
import os
import logging


# only loads documents which end with these extensions
SUPPORTED_EXTENSIONS = ["doc", "rtf", "docx"]


class Processor(AddResourceBaseProcessor):

    def _get_schema(self, resource_descriptor):
        return resource_descriptor.get("schema", {
            "fields": [
                {"name": "url", "type": "string", "description": "url to download protocol from"},
                {"name": "kns_committee_id", "type": "integer", "description": "primary key from kns_committee table"},
                {"name": "kns_session_id", "type": "integer", "description": "primary key from kns_committeesession table"}
            ],
            "primaryKey": ["kns_session_id"]
        })

    def _get_new_resource(self):
        committee_table = self.db_meta.tables.get("kns_committee")
        committeesession_table = self.db_meta.tables.get("kns_committeesession")
        documentcommitteesession_table = self.db_meta.tables.get("kns_documentcommitteesession")
        if committee_table is None or committeesession_table is None or documentcommitteesession_table is None:
            raise Exception("processor requires kns committee tables to exist")
        override_meeting_ids = os.environ.get("OVERRIDE_COMMITTEE_MEETING_IDS")
        for db_row in self.db_session\
            .query(committee_table, committeesession_table, documentcommitteesession_table)\
            .filter(committeesession_table.c.CommitteeID==committee_table.c.CommitteeID)\
            .filter(committeesession_table.c.CommitteeSessionID==documentcommitteesession_table.c.CommitteeSessionID)\
            .filter(or_(*(documentcommitteesession_table.c.FilePath.like("%.{}".format(e)) for e in SUPPORTED_EXTENSIONS)))\
        .all():
            row = db_row._asdict()
            if str(row["GroupTypeID"]) == "23":
                if not override_meeting_ids or str(row["CommitteeSessionID"]) in override_meeting_ids.split(","):
                    yield {"url": row["FilePath"],
                        "kns_committee_id": row["CommitteeID"],
                        "kns_session_id": row["CommitteeSessionID"]}


if __name__ == "__main__":
    Processor.main()
