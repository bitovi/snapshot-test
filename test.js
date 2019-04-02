import QUnit from 'steal-qunit';
import {compareToSnapshot} from "@bitovi/snapshot-test";

QUnit.module("snapshot-test");

QUnit.test("compareToSnapshot", function(){
	QUnit.ok(compareToSnapshot, "compareToSnapshot exists");
});
