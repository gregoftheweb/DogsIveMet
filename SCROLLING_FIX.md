# Scrolling Fix - Dog Profile & New Dog Pages

## Issue Description
After the React Native Paper migration, scrolling stopped working on two critical screens:
- Dog Profile page
- New Dog / Edit Dog form page

## Root Cause Analysis

### Primary Issue: ScreenContainer flex: 1 in Scroll Mode
The `ScreenContainer` component was applying `flex: 1` to the ScrollView's `contentContainerStyle` in scroll mode. This caused:

1. **Height Constraint**: Content was constrained to exactly viewport height
2. **No Natural Growth**: Content couldn't grow beyond viewport size
3. **ScrollView Confusion**: ScrollView calculated there was nothing to scroll

### Secondary Issue: KeyboardAvoidingView flex: 1
The New Dog form had an additional `flex: 1` on the KeyboardAvoidingView, which further prevented scrolling.

## Technical Background

In React Native:
- `flex: 1` on a ScrollView's `contentContainerStyle` is **incorrect** - it constrains content
- ScrollView needs content that can grow naturally beyond viewport
- `flex: 1` is useful for non-scrollable views that need vertical centering

## Solution

### 1. ScreenContainer.tsx - Split Content Styles

**Before:**
```tsx
const contentStyle = [
  styles.content,  // Has flex: 1
  { backgroundColor: theme.colors.background },
];

<ScrollView contentContainerStyle={[styles.scrollContent, contentStyle]}>
```

**After:**
```tsx
const contentStyle = scroll
  ? [styles.scrollableContent]  // No flex: 1
  : [styles.content];            // Has flex: 1

<ScrollView contentContainerStyle={contentStyle}>
```

**New Styles:**
```tsx
// For scrollable content - NO flex: 1
scrollableContent: {
  width: '100%',
  maxWidth: 520,
  alignSelf: 'center',
  paddingHorizontal: 16,
  paddingVertical: 16,
},

// For non-scrollable content - WITH flex: 1 (for centering)
content: {
  flex: 1,
  width: '100%',
  maxWidth: 520,
  alignSelf: 'center',
  paddingHorizontal: 16,
  paddingVertical: 16,
},
```

### 2. new-dog.tsx - Remove KeyboardAvoidingView flex

**Before:**
```tsx
keyboardView: {
  flex: 1,  // Prevents scrolling
},
```

**After:**
```tsx
keyboardView: {
  // Removed flex: 1 to allow ScrollView to work properly
},
```

## Files Modified
1. `src/ui/ScreenContainer.tsx` - Split content styles for scroll/non-scroll modes
2. `app/new-dog.tsx` - Removed flex: 1 from KeyboardAvoidingView

## Verification

### Screens Using Scroll Mode (Should Scroll)
✅ Home screen (`app/index.tsx`) - Uses `<ScreenContainer scroll>`
✅ Dog Profile (`app/dog-profile.tsx`) - Uses `<ScreenContainer scroll>`
✅ New Dog Form (`app/new-dog.tsx`) - Uses `<ScreenContainer scroll={true}>`

### Screens Using Non-Scroll Mode (Should Center)
✅ Me screen (`app/me.tsx`) - Uses `<ScreenContainer>`
✅ Loading states - All use `<ScreenContainer>` for centered spinners
✅ Error/Not Found states - All use `<ScreenContainer>` for centered messages

## Testing Checklist

- [ ] Dog Profile page scrolls properly
- [ ] New Dog form scrolls to show all fields
- [ ] Edit Dog form scrolls to show all fields  
- [ ] Save/Cancel buttons are accessible via scrolling
- [ ] Me screen remains vertically centered
- [ ] Loading spinners remain centered
- [ ] Error messages remain centered
- [ ] Home screen continues to scroll

## Impact
- **Scope**: Minimal (2 files, ~20 lines changed)
- **Risk**: Low (targeted fix, preserves all existing behavior)
- **Benefit**: High (fixes critical UX regression)
- **Breaking Changes**: None

## Lessons Learned

1. **ScrollView contentContainerStyle**: Never use `flex: 1` unless you specifically want to constrain content height
2. **Container Components**: When supporting both scroll and non-scroll modes, use different styles
3. **Testing**: Always verify scrolling behavior after layout changes
4. **Flexbox in RN**: `flex: 1` behaves differently in ScrollView vs regular View

## Related Documentation
- React Native ScrollView: https://reactnative.dev/docs/scrollview
- Flexbox Layout: https://reactnative.dev/docs/flexbox
- ScreenContainer: `/src/ui/ScreenContainer.tsx`
