import React, { useMemo, useState } from 'react';
import _ from 'underscore';

import { useRoute } from '../../../../../client/contexts/RouterContext';
import { useEndpointData } from '../../../../../ee/app/engagement-dashboard/client/hooks/useEndpointData';

import { RoomsTab, UsersAndRooms } from '.';

const useQuery = (params, sort) => useMemo(() => ({
	filter: params.term || '',
	types: JSON.stringify(['c', 'p', 'd', 'l', 'discussion']),
	sort: JSON.stringify({ [sort[0]]: sort[1] === 'asc' ? 1 : -1 }),
	...params.itemsPerPage && { count: params.itemsPerPage },
	...params.current && { offset: params.current },
}), [params, sort]);


export default function RoomsTabRoute({ props }) {
	const [params, setParams] = useState({});
	const [sort, setSort] = useState(['name', 'asc']);

	const query = useQuery(params, sort);

	const go = useRoute('direct');

	const data = useEndpointData('GET', 'rooms.adminRooms', query) || {};

	const onClick = useMemo(() => (username) => (e) => {
		if (e.type === 'click' || e.key === 'Enter') {
			go({ rid: username });
		}
	}, []);

	const onHeaderClick = (id) => {
		const [sortBy, sortDirection] = sort;

		if (sortBy === id) {
			setSort([id, sortDirection === 'asc' ? 'desc' : 'asc']);
			return;
		}
		setSort([id, 'asc']);
	};

	if (sort[0] === 'name' && data?.rooms) {
		data.rooms = data.rooms.sort((a, b) => {
			const aName = a.name || a.usernames.join(' x ');
			const bName = b.name || b.usernames.join(' x ');
			if (aName === bName) { return 0; }
			const result = aName < bName ? -1 : 1;
			return sort[1] === 'asc' ? result : result * -1;
		});
	}

	return <UsersAndRooms tab='rooms' {...props}>
		<RoomsTab setParams={_.debounce(setParams, 300)} onHeaderClick={onHeaderClick} data={data} onClick={onClick} sort={sort}/>
	</UsersAndRooms>;
}