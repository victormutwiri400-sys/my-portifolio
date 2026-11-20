import unittest
from unittest.mock import Mock, patch
from unittest.mock import patch

import port


class ProjectsApiSecurityTests(unittest.TestCase):
    def setUp(self):
        self.client = port.app.test_client()

    def test_project_management_routes_reject_missing_or_invalid_admin_token(self):
        with patch.object(port, "ADMIN_TOKEN", "configured-test-secret"):
            requests = (
                ("post", "/api/projects"),
                ("put", "/api/projects/12"),
                ("delete", "/api/projects/12"),
            )
            for method, path in requests:
                with self.subTest(method=method, path=path):
                    response = getattr(self.client, method)(path, json={})
                    self.assertEqual(response.status_code, 401)
                    self.assertEqual(response.get_json()["status"], "error")

                    response = getattr(self.client, method)(
                        path,
                        json={},
                        headers={"X-Admin-Token": "wrong-secret"},
                    )
                    self.assertEqual(response.status_code, 401)

    def test_project_management_routes_reject_every_write_if_server_token_is_unset(self):
        with patch.object(port, "ADMIN_TOKEN", ""):
            for method, path in (("post", "/api/projects"), ("put", "/api/projects/12"), ("delete", "/api/projects/12")):
                with self.subTest(method=method, path=path):
                    response = getattr(self.client, method)(
                        path,
                        json={},
                        headers={"X-Admin-Token": "anything"},
                    )
                    self.assertEqual(response.status_code, 401)

    def test_projects_list_is_public_read_only(self):
        rules = [rule for rule in port.app.url_map.iter_rules() if rule.rule == "/api/projects"]
        methods = set().union(*(rule.methods for rule in rules))
        self.assertIn("GET", methods)
        self.assertIn("POST", methods)
        self.assertNotIn("PUT", methods)
        self.assertNotIn("DELETE", methods)

    def test_project_url_validation_only_accepts_http_and_https(self):
        self.assertTrue(port.valid_project_url("https://example.com/projects"))
        self.assertTrue(port.valid_project_url("http://localhost:3000"))
        self.assertTrue(port.valid_project_url("", optional=True))
        self.assertFalse(port.valid_project_url("javascript:alert(1)"))
        self.assertFalse(port.valid_project_url("//example.com"))
        self.assertFalse(port.valid_project_url("https://user:password@example.com"))
        self.assertFalse(port.valid_project_url("https://example.com/with space"))
        self.assertFalse(port.valid_project_url(""))
        self.assertFalse(port.valid_project_url("https://example.com/" + "a" * 2050))

    def test_authorized_admin_can_create_persistent_project_record(self):
        cursor = Mock()
        cursor.lastrowid = 41
        connection = Mock()
        connection.cursor.return_value = cursor
        connection.is_connected.return_value = True
        form = {
            "title": "Hotel Management System",
            "description": "Hotel reservations and operations application.",
            "category": "Full-Stack Development",
            "technologies": '["React", "Flask", "MySQL"]',
            "project_url": "https://example.com/hotel",
            "github_url": "",
            "is_featured": "true",
        }
        with patch.object(port, "ADMIN_TOKEN", "configured-test-secret"), patch.object(
            port, "get_db_connection", return_value=connection
        ):
            response = self.client.post(
                "/api/projects",
                data=form,
                headers={"X-Admin-Token": "configured-test-secret"},
            )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()["data"]["id"], 41)
        self.assertIn("INSERT INTO portfolio_projects", cursor.execute.call_args.args[0])
        inserted_fields = cursor.execute.call_args.args[1]
        self.assertEqual(inserted_fields[0], form["title"])
        self.assertEqual(inserted_fields[4], form["project_url"])
        self.assertTrue(inserted_fields[7])
        connection.commit.assert_called_once()

    def test_authorized_partial_update_keeps_existing_preview_image(self):
        existing = {
            "id": 12,
            "title": "Existing project",
            "description": "Existing description",
            "category": "Web Applications",
            "technologies": '["React"]',
            "project_url": "https://example.com/old",
            "github_url": None,
            "image_url": "https://images.example.com/kept.jpg",
            "is_featured": False,
        }
        cursor = Mock()
        cursor.fetchone.return_value = existing
        connection = Mock()
        connection.cursor.return_value = cursor
        connection.is_connected.return_value = True
        with patch.object(port, "ADMIN_TOKEN", "configured-test-secret"), patch.object(
            port, "get_db_connection", return_value=connection
        ):
            response = self.client.put(
                "/api/projects/12",
                data={"title": "Updated project", "project_url": "https://example.com/new"},
                headers={"X-Admin-Token": "configured-test-secret"},
            )

        self.assertEqual(response.status_code, 200)
        updated_fields = cursor.execute.call_args.args[1]
        self.assertEqual(updated_fields[0], "Updated project")
        self.assertEqual(updated_fields[4], "https://example.com/new")
        self.assertEqual(updated_fields[6], existing["image_url"])
        self.assertEqual(updated_fields[1], existing["description"])

    def test_authorized_admin_can_delete_project(self):
        cursor = Mock()
        cursor.rowcount = 1
        connection = Mock()
        connection.cursor.return_value = cursor
        connection.is_connected.return_value = True
        with patch.object(port, "ADMIN_TOKEN", "configured-test-secret"), patch.object(
            port, "get_db_connection", return_value=connection
        ):
            response = self.client.delete(
                "/api/projects/41",
                headers={"X-Admin-Token": "configured-test-secret"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["status"], "success")
        self.assertIn("DELETE FROM portfolio_projects", cursor.execute.call_args.args[0])
        self.assertEqual(cursor.execute.call_args.args[1], (41,))


if __name__ == "__main__":
    unittest.main()
