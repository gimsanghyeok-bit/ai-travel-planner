# Frontend Components — 의사코드 (React Native 기준)

## 1. 타임라인 드래그 앤 드롭 (`TimelineList`)
React Native에서는 웹의 HTML5 draggable 대신 `react-native-draggable-flatlist` 또는 `react-native-reanimated` + `react-native-gesture-handler` 조합을 권장.

```tsx
import DraggableFlatList from "react-native-draggable-flatlist";

function TimelineList({ places, onReorder }) {
  return (
    <DraggableFlatList
      data={places}
      keyExtractor={(item) => item.id}
      onDragEnd={({ data }) =>
        onReorder(data.map((p, i) => ({ ...p, order: i + 1 })))
      }
      renderItem={({ item, drag, isActive }) => (
        <PlaceCard place={item} onLongPress={drag} active={isActive} />
      )}
    />
  );
}
```

- `PlaceCard`는 디자인 참고(design_reference.dc.html)의 카드 스타일을 그대로 이식: 순번 뱃지, 카테고리 pill, 팁 아코디언(개별 `expanded` 상태).
- 웹(Next.js) 버전은 `@dnd-kit/sortable`로 동일 인터랙션 구현.

## 2. 경비 정산 (`ExpenseSplitter`)

```ts
type Expense = { id: string; amount: number; payerId: string };

function computeSettlement(expenses: Expense[], memberIds: string[]) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = total / memberIds.length;

  const paidByMember = Object.fromEntries(memberIds.map((id) => [id, 0]));
  expenses.forEach((e) => { paidByMember[e.payerId] += e.amount; });

  return memberIds.map((id) => {
    const diff = Math.round(paidByMember[id] - perPerson);
    return { memberId: id, amount: Math.abs(diff), direction: diff >= 0 ? "receive" : "pay" };
  });
}
```

- N분의 1(균등) 정산이 기본. 비율 정산(`split_type = 'ratio'`)이 필요하면 `split_ratios`(멤버별 비율 map)로 `perPerson`을 멤버별 가중 배분으로 대체.
- 입력 폼: 항목명, 금액, 결제자 선택 — 디자인 참고의 정산 탭 폼 그대로 이식.

## 3. 예약 옵션 선택 (`BookingOptionCard`)
- 섹션(항공/숙소/렌터카)별로 라디오 방식 단일 선택. 선택 시 상위 상태(`selectedFlight/Hotel/Car`)를 갱신하고, 정산 탭의 `budgetEstimate.flight/hotel/car`을 즉시 재계산.
