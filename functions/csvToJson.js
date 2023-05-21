import { group } from 'console';
import fs from 'fs';

const csv = fs.readFileSync('dosisool.csv', 'utf-8');

const rows = csv.split('\r\n');

const data = rows.splice(1);

console.log(data);

const result = data.reduce(
	(acc, cur) => {
		const curs = cur.split(',');
		const groupName = curs[0];
		const itemName = curs[1];
		const description = curs[2];
		const price = (curs[3].trim().slice(1, -1) / 10000).toFixed(1);

		const item = {
			name: itemName,
			description,
			price
		};

		const foundGroup = acc.groups.find((group) => group.name === groupName);
		if (foundGroup) {
			foundGroup.items = [...foundGroup.items, item];
		} else {
			acc.groups = [
				...acc.groups,
				{
					name: groupName,
					items: [item]
				}
			];
		}
		return acc;
	},
	{
		title: { value: 'dosisool' },
		headers: [],
		groups: [],
		footers: []
	}
);

console.log(result);

fs.writeFileSync('dosisool.json', JSON.stringify(result));
